"""
Travel Mate - Data Ingestion and Preprocessing Pipeline
======================================================
Original Dataset Source:
https://github.com/SampurnaK/indian-tourist-attractions-analysis
File: datasets/india/indian_tourist_attractions.xlsx

Strictly Popularity-Based Architecture:
- Uses ONLY Bayesian Weighted Rating (True Bayesian Estimate / IMDB Weighted Rating).
- Explicitly DOES NOT use NCF, Matrix Factorization, Item-Based Collaborative Filtering,
  or hybrid models.
- Preserves actual dataset records without artificial inflation or fabrication.
"""

import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.destination import Destination

DEFAULT_DATASET_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../datasets/india/indian_tourist_attractions.xlsx")
)

class TourismDataLoader:
    """
    Ingests, cleans, standardizes, ranks, and loads the Indian Tourist Attractions dataset.
    """

    def __init__(self, file_path: str = DEFAULT_DATASET_PATH):
        self.file_path = file_path
        self.raw_df: Optional[pd.DataFrame] = None
        self.cleaned_df: Optional[pd.DataFrame] = None
        self.bayesian_mean_c: float = 0.0
        self.bayesian_m_threshold: float = 0.0
        self.dataset_stats: Dict[str, Any] = {}

    def load_raw_data(self) -> pd.DataFrame:
        """Loads original Excel dataset preserving raw values."""
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"Dataset file not found at: {self.file_path}")

        print(f"Loading raw dataset from: {self.file_path}")
        self.raw_df = pd.read_excel(self.file_path)
        print(f"Raw dataset loaded successfully: {self.raw_df.shape[0]} rows, {self.raw_df.shape[1]} columns.")
        return self.raw_df

    def preprocess(self) -> pd.DataFrame:
        """
        Executes complete preprocessing pipeline:
        - Missing value imputation
        - Duplicate detection & removal
        - Rating & review count conversion
        - State and city standardization
        - Category/type cleaning
        - Bayesian Weighted Rating calculation
        """
        if self.raw_df is None:
            self.load_raw_data()

        df = self.raw_df.copy()

        # 1. Column normalization (strip whitespace from column names)
        df.columns = [col.strip() for col in df.columns]

        # 2. Duplicate Removal
        initial_count = len(df)
        df = df.drop_duplicates(subset=["Name", "City", "State"], keep="first")
        removed_dupes = initial_count - len(df)
        if removed_dupes > 0:
            print(f"Removed {removed_dupes} duplicate destination records.")

        # 3. Missing Value Handling
        # 'Weekly Off' is predominantly null indicating open daily (no day off)
        if "Weekly Off" in df.columns:
            df["Weekly Off"] = df["Weekly Off"].fillna("None").astype(str).str.strip()

        # Clean string columns
        string_cols = ["Zone", "State", "City", "Name", "Type", "Significance", "Best Time to visit"]
        for col in string_cols:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip()

        # 4. State & City Standardization
        # Standardize state and city capitalization (Title Case)
        df["State"] = df["State"].str.title().replace({
            "Andaman And Nicobar Islands": "Andaman and Nicobar Islands",
            "Daman And Diu": "Daman and Diu",
            "Jammu And Kashmir": "Jammu and Kashmir",
        })
        df["City"] = df["City"].str.title()
        df["Zone"] = df["Zone"].str.title()
        df["Type"] = df["Type"].str.title()
        df["Significance"] = df["Significance"].str.title()
        df["Best Time to visit"] = df["Best Time to visit"].str.title().replace({"All": "All Day", "Afternoon": "Afternoon", "Evening": "Evening", "Morning": "Morning"})

        # 5. Rating & Review Count Conversion
        # Convert ratings to float
        df["Google review rating"] = pd.to_numeric(df["Google review rating"], errors="coerce")
        df["Google review rating"] = df["Google review rating"].fillna(df["Google review rating"].mean()).round(2)

        # Convert reviews in lakhs to numeric and calculate total absolute reviews
        df["Number of google review in lakhs"] = pd.to_numeric(df["Number of google review in lakhs"], errors="coerce").fillna(0.0)
        # 1 Lakh = 100,000 reviews
        df["total_reviews"] = (df["Number of google review in lakhs"] * 100000).round().astype(int)

        # Entrance Fee
        df["Entrance Fee in INR"] = pd.to_numeric(df["Entrance Fee in INR"], errors="coerce").fillna(0).astype(int)

        # Time Needed in Hours
        df["Time needed to visit in hrs"] = pd.to_numeric(df["Time needed to visit in hrs"], errors="coerce").fillna(1.0).round(2)

        # Establishment Year (keep valid integer, negative represents BC)
        df["Establishment Year"] = pd.to_numeric(df["Establishment Year"], errors="coerce")
        df["Establishment Year"] = df["Establishment Year"].apply(lambda y: int(y) if pd.notnull(y) and y != 0 else None)

        # Boolean mappings
        df["Airport with 50km Radius"] = df["Airport with 50km Radius"].astype(str).str.strip().str.lower().isin(["yes", "true", "1"])
        df["DSLR Allowed"] = df["DSLR Allowed"].astype(str).str.strip().str.lower().isin(["yes", "true", "1"])

        # 6. Bayesian Weighted Rating Calculation (Popularity-Based Metric)
        # Formula: WR = (v / (v + m)) * R + (m / (v + m)) * C
        # R = average rating of destination
        # v = number of reviews (total_reviews)
        # C = mean rating across the entire dataset
        # m = minimum review threshold (50th percentile of dataset reviews to ensure statistical credibility)
        C = float(df["Google review rating"].mean())
        m = float(df["Number of google review in lakhs"].quantile(0.50))  # 50th percentile
        v = df["Number of google review in lakhs"]
        R = df["Google review rating"]

        df["bayesian_weighted_rating"] = ((v / (v + m)) * R + (m / (v + m)) * C).round(4)

        # 7. Popularity Rank (1 is top ranked)
        df["popularity_rank"] = df["bayesian_weighted_rating"].rank(ascending=False, method="min").astype(int)

        # Sort primarily by popularity rank, then review volume
        df = df.sort_values(by=["popularity_rank", "total_reviews"], ascending=[True, False]).reset_index(drop=True)

        self.bayesian_mean_c = round(C, 4)
        self.bayesian_m_threshold = round(m, 4)
        self.cleaned_df = df

        # Compute summary statistics
        self.dataset_stats = {
            "total_destinations": int(len(df)),
            "unique_states": int(df["State"].nunique()),
            "unique_cities": int(df["City"].nunique()),
            "unique_types": int(df["Type"].nunique()),
            "unique_zones": int(df["Zone"].nunique()),
            "avg_rating": round(float(df["Google review rating"].mean()), 2),
            "min_rating": float(df["Google review rating"].min()),
            "max_rating": float(df["Google review rating"].max()),
            "avg_reviews_lakhs": round(float(df["Number of google review in lakhs"].mean()), 3),
            "max_reviews_lakhs": float(df["Number of google review in lakhs"].max()),
            "bayesian_mean_c": self.bayesian_mean_c,
            "bayesian_m_threshold_reviews": int(m * 100000),
            "source": "https://github.com/SampurnaK/indian-tourist-attractions-analysis",
        }

        print("Preprocessing completed successfully.")
        return self.cleaned_df

    def get_top_destinations(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Returns the top N popular destinations in India based on Bayesian Weighted Rating."""
        if self.cleaned_df is None:
            self.preprocess()
        top_df = self.cleaned_df.head(limit)
        return top_df.to_dict(orient="records")

    def get_state_wise_popular(self, top_per_state: int = 3) -> Dict[str, List[Dict[str, Any]]]:
        """Returns the top popular destinations grouped by State."""
        if self.cleaned_df is None:
            self.preprocess()
        results: Dict[str, List[Dict[str, Any]]] = {}
        for state, group in self.cleaned_df.groupby("State"):
            sorted_group = group.sort_values(by="bayesian_weighted_rating", ascending=False).head(top_per_state)
            results[state] = sorted_group.to_dict(orient="records")
        return results

    def get_city_wise_popular(self, top_per_city: int = 3, min_destinations: int = 2) -> Dict[str, List[Dict[str, Any]]]:
        """Returns the top popular destinations grouped by City (for cities with at least min_destinations)."""
        if self.cleaned_df is None:
            self.preprocess()
        results: Dict[str, List[Dict[str, Any]]] = {}
        city_counts = self.cleaned_df["City"].value_counts()
        eligible_cities = city_counts[city_counts >= min_destinations].index

        for city in eligible_cities:
            group = self.cleaned_df[self.cleaned_df["City"] == city]
            sorted_group = group.sort_values(by="bayesian_weighted_rating", ascending=False).head(top_per_city)
            results[city] = sorted_group.to_dict(orient="records")
        return results

    def get_category_wise_popular(self, top_per_category: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        """Returns the top popular destinations grouped by Category / Type."""
        if self.cleaned_df is None:
            self.preprocess()
        results: Dict[str, List[Dict[str, Any]]] = {}
        for cat, group in self.cleaned_df.groupby("Type"):
            sorted_group = group.sort_values(by="bayesian_weighted_rating", ascending=False).head(top_per_category)
            results[cat] = sorted_group.to_dict(orient="records")
        return results

    def get_seasonal_popular(self, top_per_season: int = 5) -> Dict[str, List[Dict[str, Any]]]:
        """Returns the top popular destinations grouped by Best Time to Visit (Morning, Afternoon, Evening, All Day)."""
        if self.cleaned_df is None:
            self.preprocess()
        results: Dict[str, List[Dict[str, Any]]] = {}
        for season, group in self.cleaned_df.groupby("Best Time to visit"):
            sorted_group = group.sort_values(by="bayesian_weighted_rating", ascending=False).head(top_per_season)
            results[season] = sorted_group.to_dict(orient="records")
        return results

    def store_to_database(self, session: Optional[Session] = None) -> int:
        """Stores or syncs cleaned records into the SQLite database."""
        if self.cleaned_df is None:
            self.preprocess()

        # Create database tables if they do not exist
        Base.metadata.create_all(bind=engine)

        close_session = False
        if session is None:
            session = SessionLocal()
            close_session = True

        try:
            # Clear existing records to ensure clean sync with original dataset
            session.query(Destination).delete()

            records_to_insert = []
            for _, row in self.cleaned_df.iterrows():
                dest = Destination(
                    id=int(row["ID"]),
                    name=str(row["Name"]),
                    zone=str(row["Zone"]),
                    state=str(row["State"]),
                    city=str(row["City"]),
                    type=str(row["Type"]),
                    significance=str(row["Significance"]),
                    establishment_year=row["Establishment Year"],
                    time_needed_hours=float(row["Time needed to visit in hrs"]),
                    rating=float(row["Google review rating"]),
                    reviews_lakhs=float(row["Number of google review in lakhs"]),
                    total_reviews=int(row["total_reviews"]),
                    entrance_fee_inr=int(row["Entrance Fee in INR"]),
                    airport_within_50km=bool(row["Airport with 50km Radius"]),
                    weekly_off=str(row["Weekly Off"]),
                    dslr_allowed=bool(row["DSLR Allowed"]),
                    best_time_to_visit=str(row["Best Time to visit"]),
                    bayesian_weighted_rating=float(row["bayesian_weighted_rating"]),
                    popularity_rank=int(row["popularity_rank"]),
                )
                records_to_insert.append(dest)

            session.bulk_save_objects(records_to_insert)
            session.commit()
            print(f"Successfully loaded and saved {len(records_to_insert)} destinations into SQLite database.")
            return len(records_to_insert)
        except Exception as e:
            session.rollback()
            raise e
        finally:
            if close_session:
                session.close()


def run_etl_pipeline() -> Dict[str, Any]:
    """Helper runner to execute ETL and print dataset statistics."""
    loader = TourismDataLoader()
    loader.load_raw_data()
    loader.preprocess()
    count = loader.store_to_database()
    return {
        "inserted_count": count,
        "statistics": loader.dataset_stats,
        "top_10": loader.get_top_destinations(10)
    }

if __name__ == "__main__":
    result = run_etl_pipeline()
    print("\n--- DATASET ETL COMPLETE ---")
    print(f"Total inserted destinations: {result['inserted_count']}")
    print(f"Statistics: {result['statistics']}")
    print("\nTop 5 Destinations:")
    for d in result['top_10'][:5]:
        print(f"#{d['popularity_rank']} {d['Name']} ({d['City']}, {d['State']}) - WR: {d['bayesian_weighted_rating']} | Rating: {d['Google review rating']} | Reviews: {d['Number of google review in lakhs']} Lakhs")

