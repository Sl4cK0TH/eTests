from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID


class ResponseSubmit(BaseModel):
    """Single answer submission"""
    question_id: UUID
    selected_option_id: UUID


class AttemptSubmit(BaseModel):
    """Full exam submission"""
    responses: List[ResponseSubmit]


class AttemptStart(BaseModel):
    """Response when starting an exam"""
    attempt_id: UUID
    exam: "ExamSecure"  # Forward reference
    server_time: datetime
    expires_at: datetime
    
    class Config:
        from_attributes = True


class ResponseResult(BaseModel):
    """Individual question result (only after results published)"""
    question_id: UUID
    question_content: str
    selected_option_id: Optional[UUID]
    correct_option_id: UUID
    is_correct: bool
    points_earned: int
    max_points: int


class AttemptResult(BaseModel):
    """Exam result for student"""
    attempt_id: UUID
    exam_title: str
    score: int
    max_score: int
    percentage: float
    started_at: datetime
    submitted_at: Optional[datetime]
    responses: List[ResponseResult] = []
    
    class Config:
        from_attributes = True


class AttemptListResponse(BaseModel):
    """Brief attempt listing"""
    id: UUID
    exam_id: UUID
    exam_title: str
    started_at: datetime
    submitted_at: Optional[datetime]
    is_submitted: bool
    score: Optional[int]
    max_score: Optional[int]
    
    class Config:
        from_attributes = True


# Import for forward reference
from app.schemas.exam import ExamSecure
AttemptStart.model_rebuild()
