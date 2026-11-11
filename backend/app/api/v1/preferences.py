from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.preference import UserPreference
from app.schemas.preference import PreferenceRequest, PreferenceResponse
from app.utils.security import get_current_user

router = APIRouter(prefix="/preferences", tags=["User Travel Preferences"])

@router.get("", response_model=PreferenceResponse, summary="Get Current User Preferences")
def get_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetches saved travel preferences for the authenticated user."""
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No preferences configured yet for this user."
        )
    return pref.to_dict()

@router.post("", response_model=PreferenceResponse, summary="Save or Update Preferences")
def save_preferences(
    request: PreferenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Saves or updates user travel preferences in SQLite."""
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    
    # Extract numerical budget and duration
    budget_amt = request.budget_amount or 7500.0
    duration_days = request.duration_days or 3

    if pref:
        pref.interests = request.interests
        pref.budget_tier = request.budget_tier
        pref.budget_amount = budget_amt
        pref.duration_tier = request.duration_tier
        pref.duration_days = duration_days
        pref.starting_state = request.starting_state
        pref.starting_city = request.starting_city
        pref.companion_type = request.companion_type
        pref.travel_month_or_season = request.travel_month_or_season
        pref.updated_at = datetime.utcnow()
    else:
        pref = UserPreference(
            user_id=current_user.id,
            budget_tier=request.budget_tier,
            budget_amount=budget_amt,
            duration_tier=request.duration_tier,
            duration_days=duration_days,
            starting_state=request.starting_state,
            starting_city=request.starting_city,
            companion_type=request.companion_type,
            travel_month_or_season=request.travel_month_or_season
        )
        pref.interests = request.interests
        db.add(pref)

    db.commit()
    db.refresh(pref)
    return pref.to_dict()
