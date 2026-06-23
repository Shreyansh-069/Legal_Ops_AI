import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


def get_database() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("MongoDB is not connected. Call connect_to_mongo() first.")
    return _db


async def connect_to_mongo() -> None:
    global _client, _db

    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB_NAME", "legal_ops_ai")

    _client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=5000)
    _db = _client[db_name]

    await _client.admin.command("ping")

    await _db.users.create_index("email", unique=True)
    await _db.conversations.create_index([("user_id", 1), ("updated_at", -1)])
    await _db.messages.create_index([("conversation_id", 1), ("created_at", 1)])


async def close_mongo_connection() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


def mongo_connection_error_message() -> str:
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    return (
        f"Could not connect to MongoDB at {uri}. "
        "Make sure MongoDB is running, or set MONGODB_URI in backend/.env to your Atlas connection string."
    )
