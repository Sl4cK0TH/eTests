import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="navbar-brand">
                    📝 <span>eTests</span>
                </Link>

                <div className="navbar-nav">
                    {user ? (
                        <>
                            <Link to="/dashboard" className="btn btn-secondary">
                                Dashboard
                            </Link>
                            <button onClick={logout} className="btn btn-secondary">
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
