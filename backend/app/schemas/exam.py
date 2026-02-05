from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from uuid import UUID


# Option schemas
class OptionCreate(BaseModel):
    content: str
    is_correct: bool = False


class OptionResponse(BaseModel):
    """Response for teachers - includes is_correct"""
    id: UUID
    content: str
    is_correct: bool
    order: int
    
    class Config:
        from_attributes = True


class OptionSecure(BaseModel):
    """Response for students - NO is_correct field! Zero-trust client."""
    id: UUID
    content: str
    order: int
    
    class Config:
        from_attributes = True


# Question schemas
class QuestionCreate(BaseModel):
    content: str
    points: int = 1
    options: List[OptionCreate]


class QuestionResponse(BaseModel):
    """Response for teachers"""
    id: UUID
    content: str
    order: int
    points: int
    options: List[OptionResponse]
    
    class Config:
        from_attributes = True


class QuestionSecure(BaseModel):
    """Response for students - options without is_correct"""
    id: UUID
    content: str
    order: int
    points: int
    options: List[OptionSecure]
    
    class Config:
        from_attributes = True


# Exam schemas
class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    time_limit_minutes: int = 60
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    randomize_questions: bool = False
    randomize_options: bool = False


class ExamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    randomize_questions: Optional[bool] = None
    randomize_options: Optional[bool] = None
    is_published: Optional[bool] = None
    results_published: Optional[bool] = None


class ExamResponse(BaseModel):
    """Response for teachers - includes everything"""
    id: UUID
    teacher_id: UUID
    title: str
    description: Optional[str]
    time_limit_minutes: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    randomize_questions: bool
    randomize_options: bool
    is_published: bool
    results_published: bool
    created_at: datetime
    questions: List[QuestionResponse] = []
    
    class Config:
        from_attributes = True


class ExamListResponse(BaseModel):
    """Brief exam listing"""
    id: UUID
    title: str
    description: Optional[str]
    time_limit_minutes: int
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    is_published: bool
    question_count: int = 0
    
    class Config:
        from_attributes = True


class ExamSecure(BaseModel):
    """Response for students during exam - no answers"""
    id: UUID
    title: str
    description: Optional[str]
    time_limit_minutes: int
    questions: List[QuestionSecure]
    
    class Config:
        from_attributes = True
