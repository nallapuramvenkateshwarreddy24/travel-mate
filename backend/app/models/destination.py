from sqlalchemy import Column, Integer, String, Float, Boolean
from app.database import Base

class Destination(Base):
    """
    SQLAlchemy model representing Indian Tourist Attractions.
    Dataset source: https://github.com/SampurnaK/indian-tourist-attractions-analysis
    """
    __tablename__ = "destinations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    zone = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False, index=True)
    city = Column(String(100), nullable=False, index=True)
    type = Column(String(100), nullable=False, index=True)
    significance = Column(String(100), nullable=False, index=True)
    establishment_year = Column(Integer, nullable=True)
    time_needed_hours = Column(Float, nullable=False, default=1.0)
    rating = Column(Float, nullable=False, index=True)  # Google review rating
    reviews_lakhs = Column(Float, nullable=False)
    total_reviews = Column(Integer, nullable=False, index=True)  # Actual vote count
    entrance_fee_inr = Column(Integer, nullable=False, default=0)
    airport_within_50km = Column(Boolean, nullable=False, default=False)
    weekly_off = Column(String(100), nullable=False, default="None")
    dslr_allowed = Column(Boolean, nullable=False, default=True)
    best_time_to_visit = Column(String(100), nullable=False, index=True)
    bayesian_weighted_rating = Column(Float, nullable=False, index=True)
    popularity_rank = Column(Integer, nullable=False, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "zone": self.zone,
            "state": self.state,
            "city": self.city,
            "type": self.type,
            "significance": self.significance,
            "establishment_year": self.establishment_year,
            "time_needed_hours": self.time_needed_hours,
            "rating": round(self.rating, 2),
            "reviews_lakhs": round(self.reviews_lakhs, 4),
            "total_reviews": self.total_reviews,
            "entrance_fee_inr": self.entrance_fee_inr,
            "airport_within_50km": self.airport_within_50km,
            "weekly_off": self.weekly_off,
            "dslr_allowed": self.dslr_allowed,
            "best_time_to_visit": self.best_time_to_visit,
            "bayesian_weighted_rating": round(self.bayesian_weighted_rating, 4),
            "popularity_rank": self.popularity_rank,
        }

