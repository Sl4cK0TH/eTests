from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core import get_db, require_role
from app.models import User, Exam, Question, Option
from app.schemas import (
    ExamCreate, ExamUpdate, ExamResponse, ExamListResponse,
    QuestionCreate, QuestionResponse
)

router = APIRouter(prefix="/exams", tags=["Exams (Teacher)"])


@router.get("", response_model=List[ExamListResponse])
async def list_exams(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """List all exams created by the teacher."""
    result = await db.execute(
        select(Exam)
        .options(selectinload(Exam.questions))
        .where(Exam.teacher_id == current_user.id)
        .order_by(Exam.created_at.desc())
    )
    exams = result.scalars().all()
    
    return [
        ExamListResponse(
            id=e.id,
            title=e.title,
            description=e.description,
            time_limit_minutes=e.time_limit_minutes,
            start_date=e.start_date,
            end_date=e.end_date,
            is_published=e.is_published,
            question_count=len(e.questions)
        )
        for e in exams
    ]


@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
async def create_exam(
    exam_data: ExamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Create a new exam."""
    exam = Exam(
        teacher_id=current_user.id,
        title=exam_data.title,
        description=exam_data.description,
        time_limit_minutes=exam_data.time_limit_minutes,
        start_date=exam_data.start_date,
        end_date=exam_data.end_date,
        randomize_questions=exam_data.randomize_questions,
        randomize_options=exam_data.randomize_options
    )
    db.add(exam)
    await db.commit()
    await db.refresh(exam)
    
    return exam


@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Get exam details with questions and answers (teacher only)."""
    result = await db.execute(
        select(Exam)
        .options(selectinload(Exam.questions).selectinload(Question.options))
        .where(Exam.id == exam_id, Exam.teacher_id == current_user.id)
    )
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    return exam


@router.patch("/{exam_id}", response_model=ExamResponse)
async def update_exam(
    exam_id: str,
    exam_data: ExamUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Update exam settings."""
    result = await db.execute(
        select(Exam).where(Exam.id == exam_id, Exam.teacher_id == current_user.id)
    )
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    for field, value in exam_data.model_dump(exclude_unset=True).items():
        setattr(exam, field, value)
    
    await db.commit()
    await db.refresh(exam)
    
    return exam


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exam(
    exam_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Delete an exam."""
    result = await db.execute(
        select(Exam).where(Exam.id == exam_id, Exam.teacher_id == current_user.id)
    )
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    await db.delete(exam)
    await db.commit()


@router.post("/{exam_id}/questions", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def add_question(
    exam_id: str,
    question_data: QuestionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("teacher"))
):
    """Add a question to an exam."""
    # Verify exam ownership
    result = await db.execute(
        select(Exam).where(Exam.id == exam_id, Exam.teacher_id == current_user.id)
    )
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Validate at least one correct answer
    correct_count = sum(1 for opt in question_data.options if opt.is_correct)
    if correct_count != 1:
        raise HTTPException(status_code=400, detail="Each question must have exactly one correct answer")
    
    # Get current question count for ordering
    q_result = await db.execute(
        select(Question).where(Question.exam_id == exam_id)
    )
    question_count = len(q_result.scalars().all())
    
    # Create question
    question = Question(
        exam_id=exam_id,
        content=question_data.content,
        points=question_data.points,
        order=question_count
    )
    db.add(question)
    await db.flush()
    
    # Create options
    for i, opt_data in enumerate(question_data.options):
        option = Option(
            question_id=question.id,
            content=opt_data.content,
            is_correct=opt_data.is_correct,
            order=i
        )
        db.add(option)
    
    await db.commit()
    await db.refresh(question)
    
    # Reload with options
    result = await db.execute(
        select(Question)
        .options(selectinload(Question.options))
        .where(Question.id == question.id)
    )
    
    return result.scalar_one()
