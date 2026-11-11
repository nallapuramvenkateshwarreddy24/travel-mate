from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegisterRequest,
    UserLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    AuthTokenResponse,
    UserResponse
)
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthTokenResponse, summary="Register New User")
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Registers a new user with securely hashed password."""
    # Check if email already registered
    existing_user = db.query(User).filter(User.email == request.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in."
        )

    # Hash password securely
    hashed = hash_password(request.password)
    new_user = User(
        email=request.email.lower(),
        name=request.name.strip(),
        password_hash=hashed,
        role="user",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT token
    token = create_access_token({"sub": new_user.email, "role": new_user.role, "name": new_user.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user.to_dict()
    }

@router.post("/login", response_model=AuthTokenResponse, summary="User Sign In")
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticates user and returns JWT bearer token."""
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password."
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    token = create_access_token({"sub": user.email, "role": user.role, "name": user.name})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.to_dict()
    }

@router.post("/forgot-password", summary="Request Password Reset")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Simulates password reset request token generation."""
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user:
        # Avoid user enumeration by returning standard message
        return {
            "message": "If an account exists with this email, a reset authorization has been generated.",
            "reset_code": "TRAVELMATE2026"
        }

    return {
        "message": "Password reset code generated. Use code TRAVELMATE2026 to reset your password.",
        "reset_code": "TRAVELMATE2026"
    }

@router.post("/reset-password", summary="Reset Account Password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Resets user password given valid email and code."""
    if request.reset_code != "TRAVELMATE2026":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset code."
        )

    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found."
        )

    user.password_hash = hash_password(request.new_password)
    db.commit()
    return {"message": "Password has been successfully updated. You may now sign in."}

@router.get("/me", response_model=UserResponse, summary="Get Current Authenticated User")
def get_me(current_user: User = Depends(get_current_user)):
    """Returns profile of currently logged-in user without sensitive hashes."""
    return current_user.to_dict()
