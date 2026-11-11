"""
Travel Mate - Day-wise Travel Planner & Financial Allocation Engine
===================================================================
STRICT CONSTRAINTS:
- Uses ONLY the existing Popularity-Based Recommendation Engine (Bayesian Weighted Rating).
- Explicitly NO Collaborative Filtering, NCF, Matrix Factorization, or hybrid algorithms.
- Distributes genuine dataset attractions across morning, afternoon, and evening slots.
- Transparent financial budgeting: Estimates accommodation, food, and transit with clear disclaimers.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.destination import Destination
from app.schemas.preference import PreferenceRequest

INTEREST_CATEGORY_MAPPING = {
    "Historical Places": ["Fort", "Palace", "Monument", "Archaeological Site", "Tomb", "War Memorial", "Historic Town Area", "Stepwell"],
    "Nature and Wildlife": ["National Park", "Wildlife Sanctuary", "Bird Sanctuary", "Zoo", "Natural Landscape", "Botanical Garden", "Valley"],
    "Beaches": ["Beach", "Promenade", "Island"],
    "Hill Stations": ["Mountain Peak", "Valley", "Viewpoint", "Hill", "Ski Resort"],
    "Temples and Spiritual Places": ["Temple", "Gurudwara", "Monastery", "Mosque", "Church", "Shrine", "Spiritual Center"],
    "Adventure": ["Adventure Sport", "Trekking", "Ski Resort", "Cave"],
    "Cultural Experiences": ["Historic Town Area", "Ghat", "Stepwell", "Village", "Market", "Site"],
    "Museums": ["Museum", "Science Centre", "Observatory", "Film Studio"],
    "Waterfalls": ["Waterfall", "Confluence", "Dam"],
    "Family Destinations": ["Amusement Park", "Theme Park", "Botanical Garden", "Park", "Aquarium", "Mall", "Entertainment"],
}

BUDGET_TIER_MAPPING = {
    "Below ₹2,000": 1800.0,
    "₹2,000–₹5,000": 3500.0,
    "₹5,000–₹10,000": 7500.0,
    "₹10,000–₹20,000": 15000.0,
    "₹20,000–₹50,000": 30000.0,
}

DURATION_TIER_MAPPING = {
    "1 Day": 1,
    "2 Days": 2,
    "3 Days": 3,
    "5 Days": 5,
    "7 Days": 7,
}

class ItineraryPlannerService:
    """
    Constructs a day-wise itinerary matching user interests and budget,
    ranking items solely by Bayesian Popularity Score.
    """

    @classmethod
    def parse_budget_and_duration(cls, prefs: PreferenceRequest) -> tuple[float, int]:
        """Extracts numeric budget and duration days."""
        # Duration
        if prefs.duration_days and prefs.duration_days > 0:
            duration = min(max(prefs.duration_days, 1), 14)
        else:
            duration = DURATION_TIER_MAPPING.get(prefs.duration_tier, 3)

        # Budget
        if prefs.budget_amount and prefs.budget_amount > 0:
            budget = float(prefs.budget_amount)
        else:
            budget = BUDGET_TIER_MAPPING.get(prefs.budget_tier, 7500.0)

        return budget, duration

    @classmethod
    def generate_itinerary(cls, db: Session, prefs: PreferenceRequest) -> Dict[str, Any]:
        """
        Generates day-wise travel plan from user preferences using Bayesian popularity.
        """
        budget, duration_days = cls.parse_budget_and_duration(prefs)

        # 1. Map user interests to dataset categories
        target_types = set()
        for interest in prefs.interests:
            mapped = INTEREST_CATEGORY_MAPPING.get(interest, [])
            target_types.update([t.lower() for t in mapped])

        # 2. Query destinations prioritizing selected starting state and matching interests
        all_destinations: List[Destination] = db.query(Destination).all()

        def match_score(d: Destination) -> float:
            score = 0.0
            # Geographical alignment
            if d.state.lower() == prefs.starting_state.lower():
                score += 10.0
                if d.city.lower() == prefs.starting_city.lower():
                    score += 5.0
            
            # Interest category alignment
            if d.type.lower() in target_types:
                score += 8.0
            elif any(interest.lower() in d.significance.lower() for interest in prefs.interests):
                score += 5.0

            # Bayesian Weighted Rating (Primary ranking force)
            score += float(d.bayesian_weighted_rating) * 2.0
            return score

        # Sort all available attractions strictly by match + Bayesian score
        ranked_candidates = sorted(all_destinations, key=match_score, reverse=True)

        # 3. Slots needed: 3 destinations per day (Morning, Afternoon, Evening)
        slots_needed = duration_days * 3
        selected_destinations: List[Destination] = []
        selected_ids = set()

        for d in ranked_candidates:
            if d.id not in selected_ids:
                selected_destinations.append(d)
                selected_ids.add(d.id)
                if len(selected_destinations) >= slots_needed:
                    break

        # Fallback if fewer than slots_needed matched: fill with overall highest Bayesian popularity
        if len(selected_destinations) < slots_needed:
            by_popularity = (
                db.query(Destination)
                .order_by(Destination.popularity_rank.asc())
                .all()
            )
            for d in by_popularity:
                if d.id not in selected_ids:
                    selected_destinations.append(d)
                    selected_ids.add(d.id)
                    if len(selected_destinations) >= slots_needed:
                        break

        # 4. Financial Projections per Day (Standardized, realistic Indian tourism baselines)
        # Baselines differ by companion type
        companion = (prefs.companion_type or "Solo").lower()
        if "family" in companion:
            daily_hotel = 2400.0
            daily_food = 1600.0
            daily_transit = 700.0
        elif "couple" in companion:
            daily_hotel = 1800.0
            daily_food = 1000.0
            daily_transit = 500.0
        elif "friends" in companion:
            daily_hotel = 2000.0
            daily_food = 1200.0
            daily_transit = 600.0
        else:  # Solo
            daily_hotel = 900.0
            daily_food = 500.0
            daily_transit = 350.0

        total_accommodation = round(daily_hotel * duration_days, 2)
        total_food = round(daily_food * duration_days, 2)
        total_transit = round(daily_transit * duration_days, 2)

        # Calculate actual entrance fees from dataset
        total_entrance_fees = float(sum(d.entrance_fee_inr for d in selected_destinations))

        total_estimated_cost = round(total_accommodation + total_food + total_transit + total_entrance_fees, 2)
        remaining_budget = round(budget - total_estimated_cost, 2)
        is_sufficient = remaining_budget >= 0

        if is_sufficient:
            budget_msg = f"Your budget of ₹{budget:,.0f} comfortably accommodates this {duration_days}-day itinerary with an estimated surplus of ₹{remaining_budget:,.0f}."
        else:
            deficit = abs(remaining_budget)
            budget_msg = (
                f"Notice: The estimated trip cost (₹{total_estimated_cost:,.0f}) exceeds your budget of ₹{budget:,.0f} by ₹{deficit:,.0f}. "
                f"We recommend choosing budget stays, reducing duration to {max(1, duration_days - 1)} days, or prioritizing zero-fee heritage sites."
            )

        # 5. Build Day-wise Itinerary
        days: List[Dict[str, Any]] = []
        dest_iter = iter(selected_destinations)

        for day_num in range(1, duration_days + 1):
            m_dest = next(dest_iter, None)
            a_dest = next(dest_iter, None)
            e_dest = next(dest_iter, None)

            day_entry = {
                "day": day_num,
                "title": f"Day {day_num}: Exploring {prefs.starting_state} & Highlights",
                "morning": {
                    "slot": "Morning",
                    "destination": m_dest.to_dict() if m_dest else None,
                    "estimated_travel_cost": round(daily_transit / 3, 2),
                    "suggested_duration_hours": m_dest.time_needed_hours if m_dest else 2.0,
                    "notes": "Best experienced early to enjoy cooler temperatures and peaceful surroundings."
                } if m_dest else None,
                "afternoon": {
                    "slot": "Afternoon",
                    "destination": a_dest.to_dict() if a_dest else None,
                    "estimated_travel_cost": round(daily_transit / 3, 2),
                    "suggested_duration_hours": a_dest.time_needed_hours if a_dest else 2.5,
                    "notes": "Ideal for exploring sheltered architecture, galleries, or shaded walkways."
                } if a_dest else None,
                "evening": {
                    "slot": "Evening",
                    "destination": e_dest.to_dict() if e_dest else None,
                    "estimated_travel_cost": round(daily_transit / 3, 2),
                    "suggested_duration_hours": e_dest.time_needed_hours if e_dest else 1.5,
                    "notes": "Perfect for illuminated sights, evening breezes, and local atmosphere."
                } if e_dest else None,
                "day_entrance_fee": sum([
                    m_dest.entrance_fee_inr if m_dest else 0,
                    a_dest.entrance_fee_inr if a_dest else 0,
                    e_dest.entrance_fee_inr if e_dest else 0,
                ]),
                "day_transport_cost": round(daily_transit, 2)
            }
            days.append(day_entry)

        return {
            "title": f"{duration_days}-Day {prefs.starting_state} & Heritage Itinerary",
            "duration_days": duration_days,
            "starting_state": prefs.starting_state,
            "starting_city": prefs.starting_city,
            "companion_type": prefs.companion_type,
            "travel_month_or_season": prefs.travel_month_or_season,
            "financials": {
                "total_budget": budget,
                "estimated_accommodation": total_accommodation,
                "estimated_food": total_food,
                "estimated_transport": total_transit,
                "estimated_entrance_fees": total_entrance_fees,
                "total_estimated_cost": total_estimated_cost,
                "remaining_budget": remaining_budget,
                "is_budget_sufficient": is_sufficient,
                "budget_message": budget_msg,
                "disclaimer": "All costs are strictly estimated projections based on standard Indian travel averages. Actual expenses vary by season, hotel selection, and transit mode."
            },
            "days": days,
            "recommended_destinations": [d.to_dict() for d in selected_destinations[:6]]
        }
