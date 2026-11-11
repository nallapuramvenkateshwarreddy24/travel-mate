from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from app.database import Base

class SavedTrip(Base):
    """
    SQLAlchemy model storing generated and saved day-wise travel itineraries.
    """
    __tablename__ = "saved_trips"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    duration_days = Column(Integer, nullable=False, default=1)
    
    # Financial estimates
    total_budget = Column(Float, nullable=False, default=0.0)
    estimated_accommodation = Column(Float, nullable=False, default=0.0)
    estimated_food = Column(Float, nullable=False, default=0.0)
    estimated_transport = Column(Float, nullable=False, default=0.0)
    estimated_entrance_fees = Column(Float, nullable=False, default=0.0)
    total_estimated_cost = Column(Float, nullable=False, default=0.0)
    remaining_budget = Column(Float, nullable=False, default=0.0)
    is_budget_sufficient = Column(Boolean, nullable=False, default=True)
    
    # Serialized day-wise itinerary structure
    itinerary_json = Column(Text, nullable=False, default="[]")
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="saved_trips")

    @property
    def itinerary(self):
        try:
            return json.loads(self.itinerary_json)
        except Exception:
            return []

    @itinerary.setter
    def itinerary(self, value):
        if isinstance(value, (list, dict)):
            self.itinerary_json = json.dumps(value)
        elif isinstance(value, str):
            self.itinerary_json = value

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "duration_days": self.duration_days,
            "total_budget": round(self.total_budget, 2),
            "estimated_accommodation": round(self.estimated_accommodation, 2),
            "estimated_food": round(self.estimated_food, 2),
            "estimated_transport": round(self.estimated_transport, 2),
            "estimated_entrance_fees": round(self.estimated_entrance_fees, 2),
            "total_estimated_cost": round(self.total_estimated_cost, 2),
            "remaining_budget": round(self.remaining_budget, 2),
            "is_budget_sufficient": self.is_budget_sufficient,
            "itinerary": self.itinerary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
