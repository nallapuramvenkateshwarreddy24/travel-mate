from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from app.database import Base

class UserPreference(Base):
    """
    SQLAlchemy model storing user travel preferences.
    """
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    
    # A. Travel Interests (stored as JSON array string)
    interests_json = Column(Text, nullable=False, default="[]")
    
    # B. Budget
    budget_tier = Column(String(100), nullable=False, default="₹5,000–₹10,000")
    budget_amount = Column(Float, nullable=False, default=7500.0)
    
    # C. Travel Duration
    duration_tier = Column(String(100), nullable=False, default="3 Days")
    duration_days = Column(Integer, nullable=False, default=3)
    
    # D. Starting Location
    starting_state = Column(String(100), nullable=False, default="Punjab")
    starting_city = Column(String(100), nullable=False, default="Amritsar")
    
    # E. Travel Companions
    companion_type = Column(String(100), nullable=False, default="Solo")
    
    # F. Travel Month or Season
    travel_month_or_season = Column(String(100), nullable=False, default="Winter")
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="preference")

    @property
    def interests(self):
        try:
            return json.loads(self.interests_json)
        except Exception:
            return []

    @interests.setter
    def interests(self, value):
        if isinstance(value, list):
            self.interests_json = json.dumps(value)
        elif isinstance(value, str):
            self.interests_json = value

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "interests": self.interests,
            "budget_tier": self.budget_tier,
            "budget_amount": self.budget_amount,
            "duration_tier": self.duration_tier,
            "duration_days": self.duration_days,
            "starting_state": self.starting_state,
            "starting_city": self.starting_city,
            "companion_type": self.companion_type,
            "travel_month_or_season": self.travel_month_or_season,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
