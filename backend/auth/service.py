from datetime import datetime, timezone

from fastapi import HTTPException, status
from pymongo.errors import DuplicateKeyError

from auth.security import hash_password, verify_password
from database.mongodb import get_database


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _user_response(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
    }


async def create_user(email: str, password: str) -> dict:
    db = get_database()
    now = datetime.now(timezone.utc)
    user_doc = {
        "email": _normalize_email(email),
        "password_hash": hash_password(password),
        "created_at": now,
    }

    try:
        result = await db.users.insert_one(user_doc)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user_doc["_id"] = result.inserted_id
    return _user_response(user_doc)


async def authenticate_user(email: str, password: str) -> dict:
    db = get_database()
    user = await db.users.find_one({"email": _normalize_email(email)})

    if not user or not verify_password(password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    return _user_response(user)


async def get_user_by_id(user_id: str) -> dict | None:
    from bson import ObjectId
    from bson.errors import InvalidId

    db = get_database()
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except InvalidId:
        return None

    if not user:
        return None

    return _user_response(user)
