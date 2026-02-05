import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core import get_db, get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.models import User
from app.schemas import UserRegister, UserLogin, TokenResponse, TokenRefresh, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user (teacher or student)."""
    # Check if email exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        role=user_data.role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return user


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT tokens."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    
    # Generate new session ID for single-login enforcement
    session_id = str(uuid.uuid4())
    user.current_session_id = session_id
    await db.commit()
    
    # Create tokens
    token_data = {"sub": str(user.id), "role": user.role.value, "session_id": session_id}
    
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data)
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: TokenRefresh, db: AsyncSession = Depends(get_db)):
    """Refresh access token using refresh token."""
    payload = decode_token(data.refresh_token)
    
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")
    
    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Verify session is still valid
    if user.current_session_id != payload.get("session_id"):
        raise HTTPException(status_code=401, detail="Session invalidated - logged in elsewhere")
    
    token_data = {"sub": str(user.id), "role": user.role.value, "session_id": user.current_session_id}
    
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data)
    )


@router.post("/logout")
async def logout(db: AsyncSession = Depends(get_db), current_user: User = Depends(__import__('app.core.security', fromlist=['get_current_user']).get_current_user)):
    """Logout and invalidate session."""
    current_user.current_session_id = None
    await db.commit()
    return {"message": "Logged out successfully"}
