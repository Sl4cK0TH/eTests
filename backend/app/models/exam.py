import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Exam(Base):
    __tablename__ = "exams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    time_limit_minutes = Column(Integer, nullable=False, default=60)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    randomize_questions = Column(Boolean, default=False)
    randomize_options = Column(Boolean, default=False)
    is_published = Column(Boolean, default=False)
    results_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teacher = relationship("User", back_populates="exams_created")
    questions = relationship("Question", back_populates="exam", lazy="selectin", order_by="Question.order")
    attempts = relationship("Attempt", back_populates="exam", lazy="selectin")


class Question(Base):
    __tablename__ = "questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    order = Column(Integer, nullable=False, default=0)
    points = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    exam = relationship("Exam", back_populates="questions")
    options = relationship("Option", back_populates="question", lazy="selectin", order_by="Option.order")


class Option(Base):
    __tablename__ = "options"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_id = Column(UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False, default=False)  # NEVER sent to client!
    order = Column(Integer, nullable=False, default=0)
    
    # Relationships
    question = relationship("Question", back_populates="options")
