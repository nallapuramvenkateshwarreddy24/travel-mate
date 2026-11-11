from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.preference import UserPreference
from app.models.trip import SavedTrip
from app.utils.security import hash_password

def seed_initial_data():
    """Initializes tables and seeds initial administrative and demo accounts if missing."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # 1. Seed Admin
        admin_email = "admin@travelmate.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                name="System Administrator",
                password_hash=hash_password("AdminPassword@123"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            print(f"Seeded Admin User: {admin_email}")

        # 2. Seed Demo Traveler
        demo_email = "traveler@travelmate.com"
        traveler = db.query(User).filter(User.email == demo_email).first()
        if not traveler:
            traveler = User(
                email=demo_email,
                name="Aditi Sharma",
                password_hash=hash_password("Traveler@123"),
                role="user",
                is_active=True
            )
            db.add(traveler)
            db.commit()
            db.refresh(traveler)

            # Add demo preference
            pref = UserPreference(
                user_id=traveler.id,
                budget_tier="₹5,000–₹10,000",
                budget_amount=8000.0,
                duration_tier="3 Days",
                duration_days=3,
                starting_state="Punjab",
                starting_city="Amritsar",
                companion_type="Family",
                travel_month_or_season="Winter"
            )
            pref.interests = ["Temples and Spiritual Places", "Historical Places", "Cultural Experiences"]
            db.add(pref)
            print(f"Seeded Demo Traveler: {demo_email}")

        db.commit()
    except Exception as e:
        db.rollback()
        print("Seeding exception:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_initial_data()
