from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, Dict, Any, List
from app.database import get_db
from app.models.destination import Destination
from app.services.recommender import PopularityRecommender
from app.schemas.destination import DestinationResponse, DestinationListResponse, DatasetStatistics

router = APIRouter(prefix="/destinations", tags=["Destinations"])

@router.get("", response_model=DestinationListResponse, summary="List & Filter Destinations")
def list_destinations(
    query: Optional[str] = Query(None, description="Search across name, city, state, or category"),
    state: Optional[str] = Query(None, description="Filter by State"),
    city: Optional[str] = Query(None, description="Filter by City"),
    category: Optional[str] = Query(None, description="Filter by Attraction Type (e.g. Temple, Fort)"),
    zone: Optional[str] = Query(None, description="Filter by Geographical Zone"),
    best_time: Optional[str] = Query(None, description="Filter by Best Time to Visit"),
    min_rating: Optional[float] = Query(None, ge=1.0, le=5.0, description="Minimum Google review rating"),
    max_fee: Optional[int] = Query(None, ge=0, description="Maximum entrance fee in INR"),
    sort_by: str = Query("popularity", description="Sort by: popularity, rating, reviews, fee_asc"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Search, filter, and paginate destinations from the Indian Tourist Attractions dataset."""
    result = PopularityRecommender.filter_destinations(
        db=db,
        query=query,
        state=state,
        city=city,
        category=category,
        zone=zone,
        best_time=best_time,
        min_rating=min_rating,
        max_fee=max_fee,
        sort_by=sort_by,
        page=page,
        page_size=page_size
    )
    return result

@router.get("/stats/summary", response_model=DatasetStatistics, summary="Dataset Statistics")
def get_dataset_stats(db: Session = Depends(get_db)):
    """Returns official summary statistics for the Indian Tourist Attractions dataset."""
    return PopularityRecommender.get_stats(db)

@router.get("/metadata/filters", summary="Filter Metadata")
def get_filter_metadata(db: Session = Depends(get_db)) -> Dict[str, List[str]]:
    """Returns list of unique states, cities, categories, zones, and visit times for frontend filters."""
    states = [s[0] for s in db.query(Destination.state).distinct().order_by(Destination.state).all()]
    cities = [c[0] for c in db.query(Destination.city).distinct().order_by(Destination.city).all()]
    types = [t[0] for t in db.query(Destination.type).distinct().order_by(Destination.type).all()]
    zones = [z[0] for z in db.query(Destination.zone).distinct().order_by(Destination.zone).all()]
    best_times = [b[0] for b in db.query(Destination.best_time_to_visit).distinct().order_by(Destination.best_time_to_visit).all()]

    return {
        "states": states,
        "cities": cities,
        "types": types,
        "zones": zones,
        "best_times": best_times
    }

@router.get("/{id}", response_model=DestinationResponse, summary="Get Destination by ID")
def get_destination(id: int, db: Session = Depends(get_db)):
    """Fetch details of a single destination by ID."""
    destination = PopularityRecommender.get_destination_by_id(db, destination_id=id)
    if not destination:
        raise HTTPException(status_code=404, detail=f"Destination with ID {id} not found.")
    return destination.to_dict()

