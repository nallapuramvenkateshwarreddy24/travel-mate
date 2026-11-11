from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.api import api_router
from app.database import engine, Base
from app.services.seeder import seed_initial_data

# Ensure tables and default admin are seeded
Base.metadata.create_all(bind=engine)
seed_initial_data()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.TAGLINE} - Powered exclusively by Popularity-Based Recommendations (Bayesian Weighted Rating) on Indian Tourist Attractions.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "recommendation_engine": "Popularity-Based (Bayesian Weighted Rating)",
        "dataset": "Indian Tourist Attractions Dataset (321 attractions, 32 states)",
        "source": "https://github.com/SampurnaK/indian-tourist-attractions-analysis",
        "api_docs": "/docs"
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    return {"status": "healthy"}
