from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database import get_db
from app.services.recommender import PopularityRecommender
from app.schemas.destination import DestinationResponse

router = APIRouter(prefix="/recommendations", tags=["Popularity Recommendations"])

@router.get("/popular", response_model=List[DestinationResponse], summary="Top Popular Destinations in India")
def get_top_popular_destinations(
    limit: int = Query(10, ge=1, le=50, description="Number of top destinations to return"),
    db: Session = Depends(get_db)
):
    """
    Returns the top N popular destinations in India ranked strictly by Bayesian Weighted Rating:
    WR = (v / (v + m)) * R + (m / (v + m)) * C
    """
    destinations = PopularityRecommender.get_top_popular(db, limit=limit)
    return [d.to_dict() for d in destinations]

@router.get("/by-state", summary="State-wise Popular Destinations")
def get_state_wise_recommendations(
    state: Optional[str] = Query(None, description="Optional state filter (e.g. Punjab, Maharashtra)"),
    top_k: int = Query(3, ge=1, le=10, description="Top destinations per state"),
    db: Session = Depends(get_db)
):
    """Returns top popular destinations grouped by State or for a specific State."""
    results = PopularityRecommender.get_state_popular(db, state=state, top_k=top_k)
    return {st: [d.to_dict() for d in dests] for st, dests in results.items()}

@router.get("/by-city", summary="City-wise Popular Destinations")
def get_city_wise_recommendations(
    city: Optional[str] = Query(None, description="Optional city filter (e.g. Amritsar, Mumbai, Jaipur)"),
    top_k: int = Query(3, ge=1, le=10, description="Top destinations per city"),
    db: Session = Depends(get_db)
):
    """Returns top popular destinations grouped by City or for a specific City."""
    results = PopularityRecommender.get_city_popular(db, city=city, top_k=top_k)
    return {c: [d.to_dict() for d in dests] for c, dests in results.items()}

@router.get("/by-category", summary="Category-wise Popular Destinations")
def get_category_wise_recommendations(
    category: Optional[str] = Query(None, description="Optional category (e.g. Temple, Fort, Beach, Palace)"),
    top_k: int = Query(5, ge=1, le=15, description="Top destinations per category"),
    db: Session = Depends(get_db)
):
    """Returns top popular destinations grouped by Category / Type."""
    results = PopularityRecommender.get_category_popular(db, category=category, top_k=top_k)
    return {cat: [d.to_dict() for d in dests] for cat, dests in results.items()}

@router.get("/seasonal", summary="Seasonal & Time-of-Day Popular Destinations")
def get_seasonal_recommendations(
    best_time: Optional[str] = Query(None, description="Best time to visit: Morning, Afternoon, Evening, All Day"),
    top_k: int = Query(5, ge=1, le=15, description="Top destinations per seasonal slot"),
    db: Session = Depends(get_db)
):
    """Returns top popular destinations grouped by Best Time to Visit."""
    results = PopularityRecommender.get_seasonal_popular(db, best_time=best_time, top_k=top_k)
    return {time_slot: [d.to_dict() for d in dests] for time_slot, dests in results.items()}

