from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any, Optional
import json

from app.database import get_db
from app.models.user import User
from app.models.preference import UserPreference
from app.models.trip import SavedTrip
from app.models.audit import AuditLog
from app.models.destination import Destination
from app.schemas.user import UserLoginRequest, AuthTokenResponse, UserResponse, AdminStatusUpdateRequest
from app.utils.security import (
    verify_password,
    create_access_token,
    get_current_admin
)

router = APIRouter(prefix="/admin", tags=["Administrator Portal"])

@router.post("/login", response_model=AuthTokenResponse, summary="Admin Login")
def admin_login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticates an administrator with role='admin'."""
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrative credentials."
        )

    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Account does not possess administrative privileges."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative account is currently deactivated."
        )

    # Log action
    audit = AuditLog(
        admin_id=user.id,
        admin_email=user.email,
        action="ADMIN_LOGIN",
        details="Admin signed into administrative dashboard."
    )
    db.add(audit)
    db.commit()

    token = create_access_token({"sub": user.email, "role": user.role, "name": user.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.get("/stats", summary="Admin Analytics & Platform Statistics")
def get_admin_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns platform-wide KPIs:
    - Total registered users
    - Total generated trips
    - Most selected travel interests
    - Most popular destinations
    - State-wise tourism statistics
    - Budget preference statistics
    - User registration statistics
    """
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    inactive_users = total_users - active_users
    total_trips = db.query(func.count(SavedTrip.id)).scalar() or 0
    total_destinations = db.query(func.count(Destination.id)).scalar() or 0

    # Aggregate Interests Frequency
    preferences = db.query(UserPreference).all()
    interest_counts: Dict[str, int] = {}
    budget_counts: Dict[str, int] = {}
    duration_counts: Dict[str, int] = {}
    state_interest_counts: Dict[str, int] = {}

    for p in preferences:
        for interest in p.interests:
            interest_counts[interest] = interest_counts.get(interest, 0) + 1
        budget_counts[p.budget_tier] = budget_counts.get(p.budget_tier, 0) + 1
        duration_counts[p.duration_tier] = duration_counts.get(p.duration_tier, 0) + 1
        state_interest_counts[p.starting_state] = state_interest_counts.get(p.starting_state, 0) + 1

    # Format interest list sorted by frequency
    sorted_interests = [
        {"interest": k, "count": v}
        for k, v in sorted(interest_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # Format budget distribution
    sorted_budgets = [
        {"tier": k, "count": v}
        for k, v in sorted(budget_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # Top 5 most popular destinations from dataset
    top_destinations = (
        db.query(Destination)
        .order_by(Destination.popularity_rank.asc())
        .limit(5)
        .all()
    )

    # State-wise attraction counts in dataset
    state_dest_counts = (
        db.query(Destination.state, func.count(Destination.id).label("count"))
        .group_by(Destination.state)
        .order_by(desc("count"))
        .limit(10)
        .all()
    )
    state_tourism_stats = [{"state": row[0], "attractions": row[1]} for row in state_dest_counts]

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users,
        "total_trips": total_trips,
        "total_destinations": total_destinations,
        "most_selected_interests": sorted_interests,
        "budget_distribution": sorted_budgets,
        "duration_distribution": [{"duration": k, "count": v} for k, v in duration_counts.items()],
        "top_origin_states": [{"state": k, "count": v} for k, v in sorted(state_interest_counts.items(), key=lambda x: x[1], reverse=True)],
        "top_popular_destinations": [d.to_dict() for d in top_destinations],
        "state_tourism_statistics": state_tourism_stats,
    }

@router.get("/users", summary="List Registered Users")
def list_users(
    query: Optional[str] = Query(None, description="Search user by name or email"),
    role: Optional[str] = Query(None, description="Filter by role: user, admin"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Returns paginated list of registered users.
    Passwords and password hashes are strictly filtered out.
    Enriched with actual preferences and saved trips count.
    """
    q = db.query(User)

    if query:
        search = f"%{query}%"
        q = q.filter(User.name.ilike(search) | User.email.ilike(search))

    if role:
        q = q.filter(User.role == role)

    if is_active is not None:
        q = q.filter(User.is_active == is_active)

    total = q.count()
    users = q.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    user_list = []
    for u in users:
        item = u.to_dict()
        pref = u.preference
        item["interests"] = pref.interests if pref else []
        item["budget_tier"] = pref.budget_tier if pref else "Not set"
        item["budget_amount"] = pref.budget_amount if pref else None
        item["duration_tier"] = pref.duration_tier if pref else "Not set"
        item["duration_days"] = pref.duration_days if pref else None
        item["starting_state"] = pref.starting_state if pref else None
        item["starting_city"] = pref.starting_city if pref else None
        item["companion_type"] = pref.companion_type if pref else None
        item["travel_month_or_season"] = pref.travel_month_or_season if pref else None
        item["saved_trips_count"] = len(u.saved_trips) if u.saved_trips else 0
        user_list.append(item)

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 1,
        "users": user_list
    }

@router.get("/users/{user_id}", summary="Get User Details with Saved Trips")
def get_user_detail(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Fetches user profile, travel preferences, and saved trips for admin inspection."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    pref = target_user.preference
    trips = target_user.saved_trips

    return {
        "user": target_user.to_dict(),
        "preferences": pref.to_dict() if pref else None,
        "saved_trips": [t.to_dict() for t in trips]
    }

@router.patch("/users/{user_id}/status", summary="Activate or Deactivate User Account")
def update_user_status(
    user_id: int,
    request: AdminStatusUpdateRequest,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin endpoint to activate or deactivate a user account."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if target_user.id == admin.id:
        raise HTTPException(status_code=400, detail="Administrators cannot deactivate their own account.")

    target_user.is_active = request.is_active

    # Record action in audit log
    action_type = "USER_ACTIVATED" if request.is_active else "USER_DEACTIVATED"
    audit = AuditLog(
        admin_id=admin.id,
        admin_email=admin.email,
        action=action_type,
        target_user_id=target_user.id,
        details=f"User {target_user.email} status changed to {'Active' if request.is_active else 'Deactivated'}. Reason: {request.reason}"
    )
    db.add(audit)
    db.commit()

    return {
        "message": f"User status updated to {'Active' if request.is_active else 'Deactivated'}.",
        "user": target_user.to_dict()
    }

@router.get("/audit-logs", summary="View Administrative Audit Logs")
def get_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Returns chronologically ordered audit logs of administrative actions."""
    total = db.query(func.count(AuditLog.id)).scalar() or 0
    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size > 0 else 1,
        "logs": [l.to_dict() for l in logs]
    }
