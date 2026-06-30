import os
import sys

# Ensure backend directory is in sys.path for Vercel deployment module resolution
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError

from agents.legal_finder import initialize_vector_db
from auth.router import router as auth_router
from chat.router import router as chat_router
from database.mongodb import close_mongo_connection, connect_to_mongo, mongo_connection_error_message

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app = FastAPI(title="Legal Ops AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ServerSelectionTimeoutError)
async def server_selection_timeout_handler(request: Request, exc: ServerSelectionTimeoutError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Database connection timeout. If you are running on Vercel, please make sure you have whitelisted 0.0.0.0/0 (Allow Access from Anywhere) in your MongoDB Atlas Network Access console."
        }
    )


@app.exception_handler(PyMongoError)
async def pymongo_exception_handler(request: Request, exc: PyMongoError):
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Database connection/operation failed: {str(exc)}"
        }
    )


app.include_router(auth_router)
app.include_router(chat_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.on_event("startup")
async def startup_event():
    try:
        await connect_to_mongo()
        print("Legal Ops AI API started. MongoDB connected.")
    except Exception as exc:
        print(f"Warning: MongoDB connection failed on startup: {exc}. Will retry on next database access.")


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


if __name__ == "__main__":
    print("Initializing and compiling the Local Vector Database...")
    initialize_vector_db()
    print("Database initialization task completed successfully.")
