from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Response, status, BackgroundTasks

from auth.dependencies import get_current_user
from auth.schemas import OTPRequest, OTPVerify, UserResponse, RegisterRequest, LoginRequest
from auth.security import COOKIE_NAME, COOKIE_SECURE, JWT_EXPIRE_HOURS, create_access_token
from auth.service import request_otp, verify_otp, register_user, login_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_200_OK)
async def register(payload: RegisterRequest, background_tasks: BackgroundTasks):
    await register_user(payload.username, payload.email, payload.password, background_tasks)
    return {"message": "Verification code sent to your email."}


@router.post("/login", response_model=UserResponse)
async def login(payload: LoginRequest, response: Response):
    user = await login_user(payload.email, payload.password)
    token = create_access_token(user["id"])
    _set_auth_cookie(response, token)
    return user


def _set_auth_cookie(response: Response, token: str) -> None:
    max_age = JWT_EXPIRE_HOURS * 3600
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="lax",
        max_age=max_age,
        path="/",
    )


def _clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(key=COOKIE_NAME, path="/")


@router.post("/otp/request", status_code=status.HTTP_200_OK)
async def request_otp_code(payload: OTPRequest, background_tasks: BackgroundTasks):
    await request_otp(payload.email, background_tasks)
    return {"message": "Verification code sent to your email."}


@router.post("/otp/verify", response_model=UserResponse)
async def verify_otp_code(payload: OTPVerify, response: Response):
    user = await verify_otp(payload.email, payload.otp)
    
    # SUCCESS WORKFLOW:
    # [JWT access token generation placeholder]
    token = create_access_token(user["id"])
    
    _set_auth_cookie(response, token)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    _clear_auth_cookie(response)
    return None


@router.get("/me", response_model=UserResponse)
async def me(current_user: dict = Depends(get_current_user)):
    return current_user
