from fastapi import APIRouter
from app.api.routes import auth, exams, student

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(exams.router)
api_router.include_router(student.router)
