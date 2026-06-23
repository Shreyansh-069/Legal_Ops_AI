from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Response, status

from auth.dependencies import get_current_user
from auth.schemas import LoginRequest, SignupRequest, UserResponse
from auth.security import COOKIE_NAME, COOKIE_SECURE, JWT_EXPIRE_HOURS, create_access_token
from auth.service import authenticate_user, create_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


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


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, response: Response):
    user = await create_user(payload.email, payload.password)
    token = create_access_token(user["id"])
    _set_auth_cookie(response, token)
    return user


@router.post("/login", response_model=UserResponse)
async def login(payload: LoginRequest, response: Response):
    user = await authenticate_user(payload.email, payload.password)
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
