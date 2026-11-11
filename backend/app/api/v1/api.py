from fastapi import APIRouter
from app.api.v1.destinations import router as destinations_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.auth import router as auth_router
from app.api.v1.preferences import router as preferences_router
from app.api.v1.itineraries import router as itineraries_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter()
api_router.include_router(destinations_router)
api_router.include_router(recommendations_router)
api_router.include_router(auth_router)
api_router.include_router(preferences_router)
api_router.include_router(itineraries_router)
api_router.include_router(admin_router)
