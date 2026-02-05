import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const { user } = useAuth();

    return (
        <div className="landing">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="container">
                    <Link to="/" className="landing-logo">
                        📝 <span>eTests</span>
                    </Link>
                    <div className="landing-nav-links">
                        {user ? (
                            <Link to="/dashboard" className="btn btn-primary">
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-secondary">
                                    Sign In
                                </Link>
                                <Link to="/register" className="btn btn-primary">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-bg"></div>
                <div className="container hero-content">
                    <div className="hero-badge">🔒 Zero-Trust Security</div>
                    <h1 className="hero-title">
                        The Future of<br />
                        <span className="gradient-text">Secure Online Exams</span>
                    </h1>
                    <p className="hero-subtitle">
                        Create, manage, and deliver tamper-proof assessments with military-grade security.
                        Answer keys never leave the server.
                    </p>
                    <div className="hero-cta">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Start Free Trial
                            <span className="btn-arrow">→</span>
                        </Link>
                        <a href="#features" className="btn btn-secondary btn-lg">
                            Learn More
                        </a>
                    </div>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-value">100%</span>
                            <span className="stat-label">Cheat-Proof</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-value">0ms</span>
                            <span className="stat-label">Answer Exposure</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat">
                            <span className="stat-value">24/7</span>
                            <span className="stat-label">Availability</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <div className="container">
                    <div className="section-header">
                        <h2>Why Choose eTests?</h2>
                        <p>Built from the ground up with security as the core principle</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🛡️</div>
                            <h3>Server-Side Grading</h3>
                            <p>Answer keys are never sent to the browser. Grading happens entirely on our secure servers.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">⏱️</div>
                            <h3>Tamper-Proof Timer</h3>
                            <p>Server-synced countdown that can't be manipulated by changing device time.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔐</div>
                            <h3>Session Locking</h3>
                            <p>Prevent multiple logins from the same account. One student, one session.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🎲</div>
                            <h3>Smart Randomization</h3>
                            <p>Shuffle questions and options for each student to prevent answer sharing.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">💾</div>
                            <h3>Auto-Save</h3>
                            <p>Answers are saved every 30 seconds. No data lost on browser crashes.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Rich Analytics</h3>
                            <p>Detailed insights on student performance and question difficulty.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Get started in minutes, not hours</p>
                    </div>

                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Create Your Exam</h3>
                            <p>Build exams with our intuitive editor. Add MCQs, images, and set time limits.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Invite Students</h3>
                            <p>Share a simple link. Students sign up and access their assigned exams.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Review Results</h3>
                            <p>Get instant grading for MCQs. Review analytics and publish results.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card">
                        <h2>Ready to Transform Your Assessments?</h2>
                        <p>Join thousands of educators who trust eTests for secure online examinations.</p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Get Started Free
                            <span className="btn-arrow">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <span className="landing-logo">📝 <span>eTests</span></span>
                            <p>Secure online examination platform with zero-trust architecture.</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-col">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#pricing">Pricing</a>
                                <a href="#security">Security</a>
                            </div>
                            <div className="footer-col">
                                <h4>Company</h4>
                                <a href="#about">About</a>
                                <a href="#contact">Contact</a>
                                <a href="#blog">Blog</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 eTests. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
