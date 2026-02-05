# 📝 eTests - Secure Online Examination Platform

A zero-trust online examination platform designed to prevent cheating through server-side answer key management and advanced security features.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5+-blue.svg)

## 🔒 Security Philosophy

**Answer keys NEVER leave the server.** Unlike traditional exam platforms where answers are exposed in browser network requests, eTests implements a zero-trust architecture where:

- ✅ Questions are served **without** correct answer indicators
- ✅ Grading happens **entirely server-side**
- ✅ Results are calculated and returned after submission
- ✅ Session locking prevents multiple simultaneous logins

## ✨ Features

### Core Security
- **Server-Side Grading** - Answer keys stored securely, never exposed to clients
- **Tamper-Proof Timer** - Server-synced countdown that can't be manipulated
- **Session Locking** - One student, one active session
- **JWT Authentication** - Secure token-based auth with refresh tokens

### For Teachers
- Create and manage exams with multiple-choice questions
- Set time limits and availability windows  
- View detailed analytics and results
- Question and option randomization

### For Students
- Clean, distraction-free exam interface
- Auto-save answers every 30 seconds
- Real-time countdown timer
- Instant results after submission

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Running with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/eTests.git
cd eTests

# Copy environment file
cp backend/.env.example backend/.env

# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Environment Variables

Create `backend/.env` with:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/etests
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=["http://localhost:5173"]
DEBUG=true
```

## 🏗️ Architecture

```
eTests/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   └── routes/     # Auth, Exams, Student endpoints
│   │   ├── core/           # Config, Database, Security
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── tests/              # Backend tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── api/           # Axios client
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Async ORM with PostgreSQL
- **Pydantic** - Data validation
- **JWT** - Token-based authentication
- **bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Infrastructure
- **PostgreSQL** - Primary database
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout and invalidate session |

### Exams (Teachers)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/exams` | List teacher's exams |
| POST | `/api/exams` | Create new exam |
| GET | `/api/exams/{id}` | Get exam details |
| PUT | `/api/exams/{id}` | Update exam |
| DELETE | `/api/exams/{id}` | Delete exam |
| POST | `/api/exams/{id}/questions` | Add question |

### Student
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/exams` | List available exams |
| POST | `/api/student/exams/{id}/start` | Start exam attempt |
| POST | `/api/student/attempts/{id}/submit` | Submit answers |
| GET | `/api/student/attempts/{id}/result` | Get results |

## 🔐 Security Features

1. **Zero-Trust Client** - No sensitive data (answer keys) in browser
2. **Server-Side Validation** - All grading on backend
3. **Session Management** - Single active session per user
4. **CORS Protection** - Configurable origin restrictions
5. **Password Security** - bcrypt hashing with strength requirements

## 🎨 UI Features

- **Dark Theme** - Easy on the eyes during long exams
- **Glassmorphism** - Modern, premium design
- **Password Strength Meter** - Real-time feedback
- **Responsive Design** - Works on all devices
- **Accessible** - Keyboard navigation support

## 📋 Development

### Running Backend Locally

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Running Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built with ❤️ for secure online education**
