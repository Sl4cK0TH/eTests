import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { AttemptStart, AttemptResult } from '../types';
import Timer from '../components/Timer';
import QuestionCard from '../components/QuestionCard';
import Navbar from '../components/Navbar';

export default function TakeExam() {
    const { examId } = useParams<{ examId: string }>();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState<AttemptStart | null>(null);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<AttemptResult | null>(null);

    useEffect(() => {
        startExam();
    }, [examId]);

    const startExam = async () => {
        try {
            const { data } = await api.post<AttemptStart>(`/student/exams/${examId}/start`);
            setAttempt(data);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            setError(error.response?.data?.detail || 'Failed to start exam');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectOption = (questionId: string, optionId: string) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    };

    const handleSubmit = useCallback(async () => {
        if (!attempt || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const responses = Object.entries(answers).map(([questionId, optionId]) => ({
                question_id: questionId,
                selected_option_id: optionId,
            }));

            const { data } = await api.post<AttemptResult>(`/student/attempts/${attempt.attempt_id}/submit`, {
                responses,
            });

            setResult(data);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            setError(error.response?.data?.detail || 'Failed to submit exam');
            setIsSubmitting(false);
        }
    }, [attempt, answers, isSubmitting]);

    const handleTimerExpire = useCallback(() => {
        handleSubmit();
    }, [handleSubmit]);

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="page">
                    <div className="loading">
                        <div className="spinner" />
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="page">
                    <div className="container">
                        <div className="alert alert-error">{error}</div>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (result) {
        return (
            <>
                <Navbar />
                <div className="page">
                    <div className="container" style={{ maxWidth: '600px' }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h1 style={{ marginBottom: '1rem' }}>🎉 Exam Submitted!</h1>
                            <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                                {result.score} / {result.max_score}
                            </h2>
                            <p style={{ fontSize: '1.5rem', color: 'var(--color-secondary)', marginBottom: '2rem' }}>
                                {result.percentage.toFixed(1)}%
                            </p>
                            <div className="progress-bar" style={{ marginBottom: '2rem' }}>
                                <div className="progress-fill" style={{ width: `${result.percentage}%` }} />
                            </div>
                            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!attempt) return null;

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = attempt.exam.questions?.length || 0;

    return (
        <>
            <nav className="navbar">
                <div className="container navbar-content">
                    <div>
                        <h3 style={{ marginBottom: '0.25rem' }}>{attempt.exam.title}</h3>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                            {answeredCount} of {totalQuestions} answered
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Timer expiresAt={new Date(attempt.expires_at)} onExpire={handleTimerExpire} />
                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="page">
                <div className="container" style={{ maxWidth: '800px' }}>
                    {attempt.exam.questions?.map((question, index) => (
                        <QuestionCard
                            key={question.id}
                            question={question}
                            questionNumber={index + 1}
                            selectedOptionId={answers[question.id] || null}
                            onSelectOption={handleSelectOption}
                        />
                    ))}

                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button
                            onClick={handleSubmit}
                            className="btn btn-primary"
                            disabled={isSubmitting}
                            style={{ padding: '1rem 3rem', fontSize: '1.125rem' }}
                        >
                            {isSubmitting ? 'Submitting...' : '✓ Submit Exam'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
