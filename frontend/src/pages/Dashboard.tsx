import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/client';
import { Exam, Attempt } from '../types';

export default function Dashboard() {
    const { user } = useAuth();
    const [exams, setExams] = useState<Exam[]>([]);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            if (user?.role === 'teacher') {
                const { data } = await api.get<Exam[]>('/exams');
                setExams(data);
            } else {
                const [examsRes, attemptsRes] = await Promise.all([
                    api.get<Exam[]>('/student/exams'),
                    api.get<Attempt[]>('/student/attempts'),
                ]);
                setExams(examsRes.data);
                setAttempts(attemptsRes.data);
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getAttemptForExam = (examId: string) => {
        return attempts.find((a) => a.exam_id === examId);
    };

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

    return (
        <>
            <Navbar />
            <div className="page">
                <div className="container">
                    <div className="dashboard-header">
                        <h1>Welcome back! 👋</h1>
                        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>
                            {user?.role === 'teacher'
                                ? 'Manage your exams and view student performance'
                                : 'View available exams and your results'}
                        </p>
                    </div>

                    {user?.role === 'teacher' && (
                        <div style={{ marginBottom: '2rem' }}>
                            <Link to="/exams/create" className="btn btn-primary">
                                ➕ Create New Exam
                            </Link>
                        </div>
                    )}

                    <h2 style={{ marginBottom: '1.5rem' }}>
                        {user?.role === 'teacher' ? 'Your Exams' : 'Available Exams'}
                    </h2>

                    {exams.length === 0 ? (
                        <div className="card">
                            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                                {user?.role === 'teacher'
                                    ? 'No exams created yet. Click "Create New Exam" to get started!'
                                    : 'No exams available at the moment.'}
                            </p>
                        </div>
                    ) : (
                        <div className="dashboard-grid">
                            {exams.map((exam) => {
                                const attempt = getAttemptForExam(exam.id);
                                return (
                                    <div key={exam.id} className="card exam-card">
                                        <h3 className="exam-title">{exam.title}</h3>
                                        {exam.description && (
                                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                                                {exam.description}
                                            </p>
                                        )}
                                        <div className="exam-meta">
                                            <span className="exam-meta-item">⏱️ {exam.time_limit_minutes} min</span>
                                            <span className="exam-meta-item">📝 {exam.question_count || 0} questions</span>
                                        </div>

                                        {user?.role === 'student' && (
                                            <>
                                                {attempt?.is_submitted ? (
                                                    <div style={{ marginTop: '1rem' }}>
                                                        <div className="alert alert-success" style={{ marginBottom: '0.75rem' }}>
                                                            ✅ Completed
                                                            {attempt.score !== undefined && ` - Score: ${attempt.score}/${attempt.max_score}`}
                                                        </div>
                                                        <Link to={`/attempts/${attempt.id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                                                            View Results
                                                        </Link>
                                                    </div>
                                                ) : attempt ? (
                                                    <Link to={`/exams/${exam.id}/take`} className="btn btn-warning" style={{ width: '100%', marginTop: '1rem', background: 'var(--color-warning)', color: '#000' }}>
                                                        ▶️ Continue Exam
                                                    </Link>
                                                ) : (
                                                    <Link to={`/exams/${exam.id}/take`} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                                        Start Exam
                                                    </Link>
                                                )}
                                            </>
                                        )}

                                        {user?.role === 'teacher' && (
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                <Link to={`/exams/${exam.id}/edit`} className="btn btn-secondary" style={{ flex: 1 }}>
                                                    ✏️ Edit
                                                </Link>
                                                <span className={`btn ${exam.is_published ? 'btn-secondary' : 'btn-primary'}`} style={{ flex: 1 }}>
                                                    {exam.is_published ? '🟢 Published' : '📝 Draft'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
