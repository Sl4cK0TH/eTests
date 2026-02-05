import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Password strength calculator
const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 4) return { score: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 5) return { score: 3, label: 'Good', color: '#10b981' };
    return { score: 4, label: 'Strong', color: '#22c55e' };
};

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'teacher' | 'student'>('student');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    // Computed values
    const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
    const passwordsMatch = confirmPassword.length === 0 || password === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setIsLoading(true);

        try {
            await register(email, password, fullName, role);
            navigate('/dashboard');
        } catch (err: unknown) {
            const error = err as { response?: { data?: { detail?: string } } };
            setError(error.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg"></div>

            <div className="auth-container">
                <Link to="/" className="auth-logo">
                    📝 <span>eTests</span>
                </Link>

                <div className="auth-card">
                    <div className="auth-header">
                        <h1>Create your account</h1>
                        <p>Start creating secure exams in minutes</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <span className="alert-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">Full name</label>
                            <div className="input-wrapper">
                                <span className="input-icon">👤</span>
                                <input
                                    type="text"
                                    className="form-input with-icon"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">I am a...</label>
                            <div className="role-selector">
                                <div
                                    className={`role-card ${role === 'student' ? 'selected' : ''}`}
                                    onClick={() => setRole('student')}
                                >
                                    <div className="role-icon-wrapper">
                                        <span className="role-icon">🎓</span>
                                    </div>
                                    <div className="role-info">
                                        <span className="role-title">Student</span>
                                        <span className="role-desc">Take exams & view results</span>
                                    </div>
                                    <div className="role-check">✓</div>
                                </div>
                                <div
                                    className={`role-card ${role === 'teacher' ? 'selected' : ''}`}
                                    onClick={() => setRole('teacher')}
                                >
                                    <div className="role-icon-wrapper">
                                        <span className="role-icon">👨‍🏫</span>
                                    </div>
                                    <div className="role-info">
                                        <span className="role-title">Teacher</span>
                                        <span className="role-desc">Create & manage exams</span>
                                    </div>
                                    <div className="role-check">✓</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email address</label>
                            <div className="input-wrapper">
                                <span className="input-icon">✉️</span>
                                <input
                                    type="email"
                                    className="form-input with-icon"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input with-icon with-toggle"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Create a strong password"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>

                            {/* Password Strength Indicator */}
                            {password.length > 0 && (
                                <div className="password-strength">
                                    <div className="strength-bars">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`strength-bar ${passwordStrength.score >= level ? 'active' : ''}`}
                                                style={{ backgroundColor: passwordStrength.score >= level ? passwordStrength.color : undefined }}
                                            />
                                        ))}
                                    </div>
                                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm password</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔐</span>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className={`form-input with-icon with-toggle ${confirmPassword.length > 0 && !passwordsMatch ? 'input-error' : ''} ${confirmPassword.length > 0 && passwordsMatch ? 'input-success' : ''}`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter your password"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </button>
                            </div>

                            {/* Password Match Indicator */}
                            {confirmPassword.length > 0 && (
                                <div className={`password-match ${passwordsMatch ? 'match' : 'no-match'}`}>
                                    <span className="match-icon">{passwordsMatch ? '✓' : '✗'}</span>
                                    <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-auth"
                            disabled={isLoading || !passwordsMatch || password.length < 8}
                        >
                            {isLoading ? (
                                <>
                                    <span className="btn-spinner"></span>
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <span className="btn-arrow">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>or</span>
                    </div>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/login" className="auth-link">
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="auth-terms">
                    By creating an account, you agree to our{' '}
                    <a href="#terms">Terms of Service</a> and{' '}
                    <a href="#privacy">Privacy Policy</a>
                </p>
            </div>
        </div>
    );
}
