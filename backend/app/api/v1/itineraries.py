from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.models.user import User
from app.models.trip import SavedTrip
from app.schemas.preference import PreferenceRequest
from app.schemas.trip import (
    GeneratedItineraryResponse,
    SaveTripRequest,
    SavedTripResponse
)
from app.services.planner import ItineraryPlannerService
from app.utils.security import get_current_user

router = APIRouter(prefix="/itineraries", tags=["Travel Itinerary Planner"])

@router.post("/generate", response_model=GeneratedItineraryResponse, summary="Generate Day-wise Itinerary")
def generate_itinerary(
    request: PreferenceRequest,
    db: Session = Depends(get_db)
):
    """
    Generates a personalized day-wise itinerary solely using Bayesian Popularity Ranking.
    Distributes destinations across morning, afternoon, and evening slots,
    and computes transparent financial projections for accommodation, food, transit, and entrance fees.
    """
    plan = ItineraryPlannerService.generate_itinerary(db, request)
    return plan

@router.post("/save", response_model=SavedTripResponse, summary="Save Itinerary to Database")
def save_itinerary(
    request: SaveTripRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stores the generated itinerary persistently in SQLite under the user's profile."""
    data = request.itinerary_data
    financials = data.get("financials", {})

    new_trip = SavedTrip(
        user_id=current_user.id,
        title=request.title or data.get("title", f"{data.get('duration_days', 3)}-Day India Tour"),
        duration_days=data.get("duration_days", 3),
        total_budget=float(financials.get("total_budget", 0.0)),
        estimated_accommodation=float(financials.get("estimated_accommodation", 0.0)),
        estimated_food=float(financials.get("estimated_food", 0.0)),
        estimated_transport=float(financials.get("estimated_transport", 0.0)),
        estimated_entrance_fees=float(financials.get("estimated_entrance_fees", 0.0)),
        total_estimated_cost=float(financials.get("total_estimated_cost", 0.0)),
        remaining_budget=float(financials.get("remaining_budget", 0.0)),
        is_budget_sufficient=bool(financials.get("is_budget_sufficient", True)),
    )
    new_trip.itinerary = data.get("days", [])

    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip.to_dict()

@router.get("/my-trips", response_model=List[SavedTripResponse], summary="Get User Saved Trips")
def get_user_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves all saved itineraries for the current user from SQLite."""
    trips = (
        db.query(SavedTrip)
        .filter(SavedTrip.user_id == current_user.id)
        .order_by(SavedTrip.created_at.desc())
        .all()
    )
    return [t.to_dict() for t in trips]

@router.get("/{trip_id}", response_model=SavedTripResponse, summary="Get Specific Saved Trip")
def get_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves single trip details verifying user ownership."""
    trip = (
        db.query(SavedTrip)
        .filter(SavedTrip.id == trip_id, SavedTrip.user_id == current_user.id)
        .first()
    )
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found or does not belong to you."
        )
    return trip.to_dict()

@router.delete("/{trip_id}", summary="Delete Saved Trip")
def delete_trip(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deletes a saved trip from SQLite."""
    trip = (
        db.query(SavedTrip)
        .filter(SavedTrip.id == trip_id, SavedTrip.user_id == current_user.id)
        .first()
    )
    if not trip:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trip not found."
        )
    db.delete(trip)
    db.commit()
    return {"message": "Trip deleted successfully."}
