from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.schemas.destination import DestinationResponse

class DestinationSlot(BaseModel):
    slot: str  # "Morning", "Afternoon", "Evening"
    destination: DestinationResponse
    estimated_travel_cost: float
    suggested_duration_hours: float
    notes: Optional[str] = None

class DayPlan(BaseModel):
    day: int
    title: str
    morning: Optional[DestinationSlot] = None
    afternoon: Optional[DestinationSlot] = None
    evening: Optional[DestinationSlot] = None
    day_entrance_fee: float
    day_transport_cost: float

class ItineraryFinancials(BaseModel):
    total_budget: float
    estimated_accommodation: float
    estimated_food: float
    estimated_transport: float
    estimated_entrance_fees: float
    total_estimated_cost: float
    remaining_budget: float
    is_budget_sufficient: bool
    budget_message: str
    disclaimer: str = "All costs are strictly estimated projections based on standard travel standards. Actual expenses vary by season and vendor."

class GeneratedItineraryResponse(BaseModel):
    title: str
    duration_days: int
    starting_state: str
    starting_city: str
    companion_type: str
    travel_month_or_season: str
    financials: ItineraryFinancials
    days: List[DayPlan]
    recommended_destinations: List[DestinationResponse]

class SaveTripRequest(BaseModel):
    title: Optional[str] = None
    itinerary_data: Dict[str, Any]

class SavedTripResponse(BaseModel):
    id: int
    user_id: int
    title: str
    duration_days: int
    total_budget: float
    estimated_accommodation: float
    estimated_food: float
    estimated_transport: float
    estimated_entrance_fees: float
    total_estimated_cost: float
    remaining_budget: float
    is_budget_sufficient: bool
    itinerary: Any
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
