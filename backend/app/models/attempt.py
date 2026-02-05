import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Attempt(Base):
    __tablename__ = "attempts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    score = Column(Integer, nullable=True)
    max_score = Column(Integer, nullable=True)
    is_submitted = Column(Boolean, default=False)
    force_submitted = Column(Boolean, default=False)  # True if auto-submitted due to timeout
    
    # Relationships
    student = relationship("User", back_populates="attempts")
    exam = relationship("Exam", back_populates="attempts")
    responses = relationship("Response", back_populates="attempt", lazy="selectin")


class Response(Base):
    __tablename__ = "responses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attempt_id = Column(UUID(as_uuid=True), ForeignKey("attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id"), nullable=False)
    selected_option_id = Column(UUID(as_uuid=True), ForeignKey("options.id"), nullable=True)
    is_correct = Column(Boolean, nullable=True)  # Calculated on submission
    answered_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    attempt = relationship("Attempt", back_populates="responses")
