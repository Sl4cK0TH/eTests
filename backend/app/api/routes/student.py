import random
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.core import get_db, require_role
from app.models import User, Exam, Question, Option, Attempt, Response
from app.schemas import (
    ExamListResponse, ExamSecure, QuestionSecure, OptionSecure,
    AttemptStart, AttemptSubmit, AttemptResult, AttemptListResponse, ResponseResult
)

router = APIRouter(prefix="/student", tags=["Student"])


@router.get("/exams", response_model=List[ExamListResponse])
async def list_available_exams(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """List published exams available for the student."""
    now = datetime.utcnow()
    
    result = await db.execute(
        select(Exam)
        .options(selectinload(Exam.questions))
        .where(
            Exam.is_published == True,
            (Exam.start_date == None) | (Exam.start_date <= now),
            (Exam.end_date == None) | (Exam.end_date >= now)
        )
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


@router.post("/exams/{exam_id}/start", response_model=AttemptStart)
async def start_exam(
    exam_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """
    Start an exam attempt.
    
    SECURITY: This endpoint returns questions WITHOUT the is_correct flag.
    The answer key NEVER leaves the server.
    """
    now = datetime.utcnow()
    
    # Get exam with questions
    result = await db.execute(
        select(Exam)
        .options(selectinload(Exam.questions).selectinload(Question.options))
        .where(
            Exam.id == exam_id,
            Exam.is_published == True,
            (Exam.start_date == None) | (Exam.start_date <= now),
            (Exam.end_date == None) | (Exam.end_date >= now)
        )
    )
    exam = result.scalar_one_or_none()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found or not available")
    
    # Check for existing incomplete attempt
    existing = await db.execute(
        select(Attempt).where(
            Attempt.student_id == current_user.id,
            Attempt.exam_id == exam_id,
            Attempt.is_submitted == False
        )
    )
    attempt = existing.scalar_one_or_none()
    
    if not attempt:
        # Check if already completed
        completed = await db.execute(
            select(Attempt).where(
                Attempt.student_id == current_user.id,
                Attempt.exam_id == exam_id,
                Attempt.is_submitted == True
            )
        )
        if completed.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="You have already completed this exam")
        
        # Create new attempt
        attempt = Attempt(
            student_id=current_user.id,
            exam_id=exam_id,
            started_at=now
        )
        db.add(attempt)
        await db.commit()
        await db.refresh(attempt)
    
    # Calculate expiry
    expires_at = attempt.started_at + timedelta(minutes=exam.time_limit_minutes)
    
    # Check if time expired
    if now > expires_at:
        # Auto-submit if time expired
        attempt.is_submitted = True
        attempt.submitted_at = expires_at
        attempt.force_submitted = True
        await db.commit()
        raise HTTPException(status_code=400, detail="Exam time has expired")
    
    # Prepare SECURE questions (no is_correct flag!)
    questions = list(exam.questions)
    if exam.randomize_questions:
        random.shuffle(questions)
    
    secure_questions = []
    for q in questions:
        options = list(q.options)
        if exam.randomize_options:
            random.shuffle(options)
        
        # CRITICAL: Convert to secure schema WITHOUT is_correct
        secure_options = [
            OptionSecure(id=o.id, content=o.content, order=i)
            for i, o in enumerate(options)
        ]
        
        secure_questions.append(
            QuestionSecure(
                id=q.id,
                content=q.content,
                order=len(secure_questions),
                points=q.points,
                options=secure_options
            )
        )
    
    secure_exam = ExamSecure(
        id=exam.id,
        title=exam.title,
        description=exam.description,
        time_limit_minutes=exam.time_limit_minutes,
        questions=secure_questions
    )
    
    return AttemptStart(
        attempt_id=attempt.id,
        exam=secure_exam,
        server_time=now,
        expires_at=expires_at
    )


@router.post("/attempts/{attempt_id}/submit", response_model=AttemptResult)
async def submit_attempt(
    attempt_id: str,
    submission: AttemptSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """
    Submit exam answers.
    
    SECURITY: Grading is done SERVER-SIDE only.
    The client never knows the correct answers during the exam.
    """
    now = datetime.utcnow()
    
    # Get attempt
    result = await db.execute(
        select(Attempt)
        .options(selectinload(Attempt.exam).selectinload(Exam.questions).selectinload(Question.options))
        .where(Attempt.id == attempt_id, Attempt.student_id == current_user.id)
    )
    attempt = result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if attempt.is_submitted:
        raise HTTPException(status_code=400, detail="Exam already submitted")
    
    # Check time limit
    expires_at = attempt.started_at + timedelta(minutes=attempt.exam.time_limit_minutes)
    force_submitted = now > expires_at
    
    # Build question/option lookup
    question_map = {q.id: q for q in attempt.exam.questions}
    option_map = {}
    for q in attempt.exam.questions:
        for o in q.options:
            option_map[o.id] = o
    
    # Process responses and calculate score SERVER-SIDE
    total_score = 0
    max_score = sum(q.points for q in attempt.exam.questions)
    response_results = []
    
    for resp in submission.responses:
        question = question_map.get(resp.question_id)
        if not question:
            continue
        
        selected_option = option_map.get(resp.selected_option_id)
        correct_option = next((o for o in question.options if o.is_correct), None)
        
        # SERVER-SIDE grading - this is where we check the answer!
        is_correct = selected_option and selected_option.is_correct
        points_earned = question.points if is_correct else 0
        total_score += points_earned
        
        # Save response
        response = Response(
            attempt_id=attempt.id,
            question_id=question.id,
            selected_option_id=resp.selected_option_id,
            is_correct=is_correct,
            answered_at=now
        )
        db.add(response)
        
        response_results.append(ResponseResult(
            question_id=question.id,
            question_content=question.content,
            selected_option_id=resp.selected_option_id,
            correct_option_id=correct_option.id if correct_option else None,
            is_correct=is_correct,
            points_earned=points_earned,
            max_points=question.points
        ))
    
    # Update attempt
    attempt.is_submitted = True
    attempt.submitted_at = now
    attempt.score = total_score
    attempt.max_score = max_score
    attempt.force_submitted = force_submitted
    
    await db.commit()
    
    # Return result (detailed breakdown only if results are published)
    return AttemptResult(
        attempt_id=attempt.id,
        exam_title=attempt.exam.title,
        score=total_score,
        max_score=max_score,
        percentage=round((total_score / max_score * 100) if max_score > 0 else 0, 2),
        started_at=attempt.started_at,
        submitted_at=attempt.submitted_at,
        responses=response_results if attempt.exam.results_published else []
    )


@router.get("/attempts", response_model=List[AttemptListResponse])
async def list_attempts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """List all exam attempts for the student."""
    result = await db.execute(
        select(Attempt)
        .options(selectinload(Attempt.exam))
        .where(Attempt.student_id == current_user.id)
        .order_by(Attempt.started_at.desc())
    )
    attempts = result.scalars().all()
    
    return [
        AttemptListResponse(
            id=a.id,
            exam_id=a.exam_id,
            exam_title=a.exam.title,
            started_at=a.started_at,
            submitted_at=a.submitted_at,
            is_submitted=a.is_submitted,
            score=a.score if a.exam.results_published else None,
            max_score=a.max_score if a.exam.results_published else None
        )
        for a in attempts
    ]


@router.get("/attempts/{attempt_id}", response_model=AttemptResult)
async def get_attempt_result(
    attempt_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role("student"))
):
    """Get detailed result for a submitted attempt (if results published)."""
    result = await db.execute(
        select(Attempt)
        .options(
            selectinload(Attempt.exam).selectinload(Exam.questions).selectinload(Question.options),
            selectinload(Attempt.responses)
        )
        .where(Attempt.id == attempt_id, Attempt.student_id == current_user.id)
    )
    attempt = result.scalar_one_or_none()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    if not attempt.is_submitted:
        raise HTTPException(status_code=400, detail="Exam not yet submitted")
    
    if not attempt.exam.results_published:
        return AttemptResult(
            attempt_id=attempt.id,
            exam_title=attempt.exam.title,
            score=0,
            max_score=0,
            percentage=0,
            started_at=attempt.started_at,
            submitted_at=attempt.submitted_at,
            responses=[]
        )
    
    # Build response details
    response_map = {r.question_id: r for r in attempt.responses}
    response_results = []
    
    for question in attempt.exam.questions:
        resp = response_map.get(question.id)
        correct_option = next((o for o in question.options if o.is_correct), None)
        
        response_results.append(ResponseResult(
            question_id=question.id,
            question_content=question.content,
            selected_option_id=resp.selected_option_id if resp else None,
            correct_option_id=correct_option.id if correct_option else None,
            is_correct=resp.is_correct if resp else False,
            points_earned=question.points if (resp and resp.is_correct) else 0,
            max_points=question.points
        ))
    
    return AttemptResult(
        attempt_id=attempt.id,
        exam_title=attempt.exam.title,
        score=attempt.score or 0,
        max_score=attempt.max_score or 0,
        percentage=round((attempt.score / attempt.max_score * 100) if attempt.max_score else 0, 2),
        started_at=attempt.started_at,
        submitted_at=attempt.submitted_at,
        responses=response_results
    )
