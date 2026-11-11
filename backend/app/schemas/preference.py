from pydantic import BaseModel, Field
from typing import List, Optional

class PreferenceRequest(BaseModel):
    interests: List[str] = Field(..., min_items=1)
    budget_tier: str = Field(..., description="e.g. Below ₹2,000, ₹2,000–₹5,000, ₹5,000–₹10,000, etc.")
    budget_amount: Optional[float] = None
    duration_tier: str = Field(..., description="e.g. 1 Day, 2 Days, 3 Days, 5 Days, 7 Days, Custom")
    duration_days: Optional[int] = None
    starting_state: str = Field(..., description="Selected starting state")
    starting_city: str = Field(..., description="Selected starting city")
    companion_type: str = Field("Solo", description="Solo, Family, Friends, Couple")
    travel_month_or_season: str = Field("Winter", description="Travel month or season")

class PreferenceResponse(BaseModel):
    id: int
    user_id: int
    interests: List[str]
    budget_tier: str
    budget_amount: float
    duration_tier: str
    duration_days: int
    starting_state: str
    starting_city: str
    companion_type: str
    travel_month_or_season: str
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True
