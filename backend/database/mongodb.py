import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None
_lock = asyncio.Lock()


async def get_database() -> AsyncIOMotorDatabase:
    global _db
    async with _lock:
        if _db is None:
            await connect_to_mongo()
        return _db


async def connect_to_mongo() -> None:
    global _client, _db

    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("MONGODB_DB_NAME", "legal_ops_ai")

    # Use certifi's CA bundle for TLS/SSL certificate verification on remote connections
    import certifi
    kwargs = {"serverSelectionTimeoutMS": 5000}
    if "mongodb+srv://" in uri or "ssl=true" in uri.lower() or "tls=true" in uri.lower():
        kwargs["tlsCAFile"] = certifi.where()

    _client = AsyncIOMotorClient(uri, **kwargs)
    _db = _client[db_name]

    try:
        await _client.admin.command("ping")
        await _db.users.create_index("email", unique=True)
        await _db.otps.create_index("email", unique=True)
        await _db.conversations.create_index([("user_id", 1), ("updated_at", -1)])
        await _db.messages.create_index([("conversation_id", 1), ("created_at", 1)])
    except Exception as exc:
        _client = None
        _db = None
        raise exc


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
