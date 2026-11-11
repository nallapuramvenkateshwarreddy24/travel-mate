from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class DestinationBase(BaseModel):
    id: int
    name: str
    zone: str
    state: str
    city: str
    type: str
    significance: str
    establishment_year: Optional[int] = None
    time_needed_hours: float
    rating: float
    reviews_lakhs: float
    total_reviews: int
    entrance_fee_inr: int
    airport_within_50km: bool
    weekly_off: str
    dslr_allowed: bool
    best_time_to_visit: str
    bayesian_weighted_rating: float
    popularity_rank: int

    class Config:
        from_attributes = True

class DestinationResponse(DestinationBase):
    pass

class DestinationListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    destinations: List[DestinationResponse]

class PopularityGroupItem(BaseModel):
    group_key: str
    destinations: List[DestinationResponse]

class DatasetStatistics(BaseModel):
    total_destinations: int
    unique_states: int
    unique_cities: int
    unique_types: int
    unique_zones: int
    avg_rating: float
    min_rating: float
    max_rating: float
    avg_reviews_lakhs: float
    max_reviews_lakhs: float
    bayesian_m_threshold_reviews: int
    bayesian_mean_c: float
    source: str

