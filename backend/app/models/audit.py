from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from app.database import Base

class AuditLog(Base):
    """
    SQLAlchemy model recording administrative security actions.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_email = Column(String(255), nullable=True)
    action = Column(String(255), nullable=False)  # e.g. "USER_DEACTIVATED", "USER_ACTIVATED", "ADMIN_LOGIN"
    target_user_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "admin_email": self.admin_email,
            "action": self.action,
            "target_user_id": self.target_user_id,
            "details": self.details,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
