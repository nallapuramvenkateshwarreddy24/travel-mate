"""
Travel Mate - Popularity-Based Recommendation Engine
===================================================
Strictly statistical popularity-based recommendations.
Formula: Bayesian Weighted Rating (IMDB Weighted Rating):
    WR = (v / (v + m)) * R + (m / (v + m)) * C
Where:
    - R: destination rating
    - v: review count
    - m: minimum review threshold for credibility (50th percentile)
    - C: overall mean rating across all attractions

EXPLICIT ARCHITECTURAL CONSTRAINTS:
- No Neural Collaborative Filtering (NCF)
- No Matrix Factorization (SVD / ALS)
- No Item-Based Collaborative Filtering
- No Hybrid Models
- No artificial/mock data generation
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from app.models.destination import Destination

class PopularityRecommender:
    """
    Pure Popularity-Based Recommender querying pre-calculated Bayesian Weighted Ratings
    and facilitating state, city, category, and seasonal ranking.
    """

    @staticmethod
    def get_top_popular(db: Session, limit: int = 10) -> List[Destination]:
        """Returns overall top popular tourist destinations across India."""
        return (
            db.query(Destination)
            .order_by(Destination.popularity_rank.asc(), Destination.total_reviews.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_state_popular(db: Session, state: Optional[str] = None, top_k: int = 5) -> Dict[str, List[Destination]]:
        """Returns popular destinations grouped by State (or for a specific state)."""
        query = db.query(Destination)
        if state:
            query = query.filter(func.lower(Destination.state) == state.lower())
            return {
                state.title(): (
                    query.order_by(Destination.bayesian_weighted_rating.desc(), Destination.total_reviews.desc())
                    .limit(top_k)
                    .all()
                )
            }

        # All states
        all_destinations = (
            db.query(Destination)
            .order_by(Destination.state, Destination.bayesian_weighted_rating.desc())
            .all()
        )
        grouped: Dict[str, List[Destination]] = {}
        for dest in all_destinations:
            grouped.setdefault(dest.state, [])
            if len(grouped[dest.state]) < top_k:
                grouped[dest.state].append(dest)
        return grouped

    @staticmethod
    def get_city_popular(db: Session, city: Optional[str] = None, top_k: int = 5) -> Dict[str, List[Destination]]:
        """Returns popular destinations grouped by City (or for a specific city)."""
        query = db.query(Destination)
        if city:
            query = query.filter(func.lower(Destination.city) == city.lower())
            return {
                city.title(): (
                    query.order_by(Destination.bayesian_weighted_rating.desc(), Destination.total_reviews.desc())
                    .limit(top_k)
                    .all()
                )
            }

        # Multi-destination cities only
        all_destinations = (
            db.query(Destination)
            .order_by(Destination.city, Destination.bayesian_weighted_rating.desc())
            .all()
        )
        city_counts: Dict[str, int] = {}
        for d in all_destinations:
            city_counts[d.city] = city_counts.get(d.city, 0) + 1

        grouped: Dict[str, List[Destination]] = {}
        for dest in all_destinations:
            if city_counts[dest.city] > 1:
                grouped.setdefault(dest.city, [])
                if len(grouped[dest.city]) < top_k:
                    grouped[dest.city].append(dest)
        return grouped

    @staticmethod
    def get_category_popular(db: Session, category: Optional[str] = None, top_k: int = 5) -> Dict[str, List[Destination]]:
        """Returns popular destinations grouped by Category / Type (e.g. Temple, Fort, Beach, Palace)."""
        query = db.query(Destination)
        if category:
            query = query.filter(func.lower(Destination.type) == category.lower())
            return {
                category.title(): (
                    query.order_by(Destination.bayesian_weighted_rating.desc(), Destination.total_reviews.desc())
                    .limit(top_k)
                    .all()
                )
            }

        all_destinations = (
            db.query(Destination)
            .order_by(Destination.type, Destination.bayesian_weighted_rating.desc())
            .all()
        )
        grouped: Dict[str, List[Destination]] = {}
        for dest in all_destinations:
            grouped.setdefault(dest.type, [])
            if len(grouped[dest.type]) < top_k:
                grouped[dest.type].append(dest)
        return grouped

    @staticmethod
    def get_seasonal_popular(db: Session, best_time: Optional[str] = None, top_k: int = 5) -> Dict[str, List[Destination]]:
        """Returns popular destinations grouped by Best Time to Visit (Morning, Afternoon, Evening, All Day)."""
        query = db.query(Destination)
        if best_time:
            query = query.filter(func.lower(Destination.best_time_to_visit) == best_time.lower())
            return {
                best_time.title(): (
                    query.order_by(Destination.bayesian_weighted_rating.desc(), Destination.total_reviews.desc())
                    .limit(top_k)
                    .all()
                )
            }

        all_destinations = (
            db.query(Destination)
            .order_by(Destination.best_time_to_visit, Destination.bayesian_weighted_rating.desc())
            .all()
        )
        grouped: Dict[str, List[Destination]] = {}
        for dest in all_destinations:
            grouped.setdefault(dest.best_time_to_visit, [])
            if len(grouped[dest.best_time_to_visit]) < top_k:
                grouped[dest.best_time_to_visit].append(dest)
        return grouped

    @staticmethod
    def get_destination_by_id(db: Session, destination_id: int) -> Optional[Destination]:
        """Fetch a single destination record by its unique dataset ID."""
        return db.query(Destination).filter(Destination.id == destination_id).first()

    @staticmethod
    def filter_destinations(
        db: Session,
        query: Optional[str] = None,
        state: Optional[str] = None,
        city: Optional[str] = None,
        category: Optional[str] = None,
        zone: Optional[str] = None,
        best_time: Optional[str] = None,
        min_rating: Optional[float] = None,
        max_fee: Optional[int] = None,
        sort_by: str = "popularity",  # "popularity", "rating", "reviews", "fee_asc"
        page: int = 1,
        page_size: int = 12
    ) -> Dict[str, Any]:
        """Search and filter destinations with pagination."""
        q = db.query(Destination)

        if query:
            search = f"%{query}%"
            q = q.filter(
                or_(
                    Destination.name.ilike(search),
                    Destination.city.ilike(search),
                    Destination.state.ilike(search),
                    Destination.type.ilike(search),
                    Destination.significance.ilike(search),
                )
            )

        if state:
            q = q.filter(func.lower(Destination.state) == state.lower())
        if city:
            q = q.filter(func.lower(Destination.city) == city.lower())
        if category:
            q = q.filter(func.lower(Destination.type) == category.lower())
        if zone:
            q = q.filter(func.lower(Destination.zone) == zone.lower())
        if best_time:
            q = q.filter(func.lower(Destination.best_time_to_visit) == best_time.lower())
        if min_rating is not None:
            q = q.filter(Destination.rating >= min_rating)
        if max_fee is not None:
            q = q.filter(Destination.entrance_fee_inr <= max_fee)

        total = q.count()

        # Sorting based strictly on popularity or specified criteria
        if sort_by == "rating":
            q = q.order_by(Destination.rating.desc(), Destination.total_reviews.desc())
        elif sort_by == "reviews":
            q = q.order_by(Destination.total_reviews.desc())
        elif sort_by == "fee_asc":
            q = q.order_by(Destination.entrance_fee_inr.asc(), Destination.popularity_rank.asc())
        else:  # Default to popularity
            q = q.order_by(Destination.popularity_rank.asc(), Destination.total_reviews.desc())

        offset = (page - 1) * page_size
        destinations = q.offset(offset).limit(page_size).all()
        total_pages = (total + page_size - 1) // page_size if page_size > 0 else 1

        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "destinations": [d.to_dict() for d in destinations]
        }

    @staticmethod
    def get_stats(db: Session) -> Dict[str, Any]:
        """Computes statistical metrics of the current dataset in the database."""
        total = db.query(func.count(Destination.id)).scalar() or 0
        unique_states = db.query(func.count(func.distinct(Destination.state))).scalar() or 0
        unique_cities = db.query(func.count(func.distinct(Destination.city))).scalar() or 0
        unique_types = db.query(func.count(func.distinct(Destination.type))).scalar() or 0
        unique_zones = db.query(func.count(func.distinct(Destination.zone))).scalar() or 0
        avg_rating = db.query(func.avg(Destination.rating)).scalar() or 0.0
        min_rating = db.query(func.min(Destination.rating)).scalar() or 0.0
        max_rating = db.query(func.max(Destination.rating)).scalar() or 0.0
        avg_reviews_lakhs = db.query(func.avg(Destination.reviews_lakhs)).scalar() or 0.0
        max_reviews_lakhs = db.query(func.max(Destination.reviews_lakhs)).scalar() or 0.0

        return {
            "total_destinations": total,
            "unique_states": unique_states,
            "unique_cities": unique_cities,
            "unique_types": unique_types,
            "unique_zones": unique_zones,
            "avg_rating": round(float(avg_rating), 2),
            "min_rating": float(min_rating),
            "max_rating": float(max_rating),
            "avg_reviews_lakhs": round(float(avg_reviews_lakhs), 3),
            "max_reviews_lakhs": float(max_reviews_lakhs),
            "bayesian_mean_c": 4.4925,
            "bayesian_m_threshold_reviews": 17000,
            "source": "https://github.com/SampurnaK/indian-tourist-attractions-analysis",
        }

