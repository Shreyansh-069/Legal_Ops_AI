import io
import os
import pathlib
import re
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import jwt
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
from pypdf import PdfReader

from fastapi import FastAPI, Request, Response, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool  # <-- Non-blocking executions ke liye zaroori hai
from pymongo import MongoClient

# =====================================================================
# 1. ENVIRONMENT CONFIGURATION & ENVIRONMENT VALIDATION
# =====================================================================
CURRENT_DIR = pathlib.Path(__file__).parent.resolve()
ENV_PATH = CURRENT_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=str(ENV_PATH))

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

if not JWT_SECRET:
    raise RuntimeError("CRITICAL ERROR: JWT_SECRET environment variable is missing from the configuration node.")

# =====================================================================
# 2. DATABASE INITIALIZATION (MONGO TIMEOUT FIXED HERE)
# =====================================================================
# Yahaan 'serverSelectionTimeoutMS=2000' add kiya hai taaki agar mongo slow ho toh engine freeze na ho
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
db = client["legalops_workspace_db"]
users_collection = db["users"]
chats_collection = db["chats"]

try:
    from agents.graph import legal_ops_graph
except ImportError:
    class MockGraph:
        def invoke(self, inputs):
            return {"final_localized_response": "SYSTEM REBOOT ERROR: Graph pipeline module binding failed."}
    legal_ops_graph = MockGraph()

# =====================================================================
# 3. CORE APPLICATION & CORS SETTINGS
# =====================================================================
app = FastAPI(title="LegalOps AI Core Engine Terminal")

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================================
# 4. SCHEMAS & GUARD DEPENDENCIES LAYOUT
# =====================================================================
class UserAuthSchema(BaseModel):
    email: EmailStr
    password: str

def get_current_user_id(request: Request) -> str:
    token = request.cookies.get("auth_token")
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Session token missing. Please log in again."
        )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Session expired. Please log in again."
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid security signature token."
        )

# =====================================================================
# 5. ASYNCHRONOUS AUTHENTICATION (FAST & THREAD-SAFE)
# =====================================================================
@app.post("/api/signup")
async def signup(user_data: UserAuthSchema):
    existing_user = users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="An account with this corporate email already exists."
        )
        
    # Heavy hashing background pool mein transfer kiye
    hashed_password = await run_in_threadpool(
        bcrypt.hashpw, 
        user_data.password.encode('utf-8'), 
        bcrypt.gensalt()
    )
    
    users_collection.insert_one({
        "email": user_data.email,
        "password": hashed_password,
        "created_at": datetime.utcnow()
    })
    return {"status": "success", "detail": "Workspace credentials registered successfully."}

@app.post("/api/login")
async def login(user_data: UserAuthSchema, response: Response):
    user = users_collection.find_one({"email": user_data.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials. Session rejected.")
        
    stored_password = user.get("password")
    if not stored_password:
        raise HTTPException(status_code=401, detail="Invalid credentials. Session rejected.")
    
    # Heavy bcrypt matching algorithm ko background execution main daal diya taaki login instant ho
    is_valid = await run_in_threadpool(
        bcrypt.checkpw, 
        user_data.password.encode('utf-8'), 
        stored_password
    )
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials. Session rejected.")
        
    token_expiry = datetime.utcnow() + timedelta(hours=24)
    session_token = jwt.encode(
        {"user_id": str(user["_id"]), "exp": token_expiry},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )
    
    response.set_cookie(
        key="auth_token",
        value=session_token,
        httponly=True,
        max_age=86400,
        expires=token_expiry.strftime("%a, %d-%b-%Y %H:%M:%S GMT"),
        samesite="lax",
        secure=False  
    )
    return {"status": "authenticated", "token": session_token}

@app.post("/api/logout")
async def logout(response: Response):
    response.delete_cookie(key="auth_token", samesite="lax", httponly=True)
    return {"status": "cleared"}

# =====================================================================
# 6. CONVERSATION CORE WORKSPACE ENDPOINTS
# =====================================================================
@app.post("/api/chat")
async def standard_chat(request: Request, user_id: str = Depends(get_current_user_id)):
    body = await request.json()
    query = body.get("query")
    language = body.get("language", "en")
    
    execution_input = {
        "raw_query": query,
        "language": language,
        "constitutional_data": "", "web_data": "", "compiled_english_advice": "", "final_localized_response": ""
    }
    
    output = await run_in_threadpool(legal_ops_graph.invoke, execution_input)
    response_text = output.get("final_localized_response", "No response generated.")
    
    chats_collection.insert_one({
        "user_id": user_id, "query": query, "response": response_text, "language": language, "timestamp": datetime.utcnow()
    })
    return {"response": response_text}

@app.post("/api/chat/upload")
async def chat_with_pdf(
    query: str = Form(...),
    language: str = Form("en"),
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid format. Only PDF uploads are supported.")
        
    try:
        pdf_content = await file.read()
        pdf_reader = PdfReader(io.BytesIO(pdf_content))
        
        extracted_text = ""
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text: 
                extracted_text += text + "\n"
                
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="The uploaded document contains no readable text content.")

        execution_input = {
            "raw_query": f"Document Context:\n{extracted_text}\n\nUser Question: {query}",
            "language": language,
            "constitutional_data": "", "web_data": "", "compiled_english_advice": "", "final_localized_response": ""
        }
        
        output = await run_in_threadpool(legal_ops_graph.invoke, execution_input)
        response_text = output.get("final_localized_response", "No response generated.")

        chats_collection.insert_one({
            "user_id": user_id, 
            "query": f"[Document Uploaded: {file.filename}] {query}", 
            "response": response_text, 
            "language": language, 
            "timestamp": datetime.utcnow()
        })
        return {"language": language, "response": response_text, "filename": file.filename}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document analytics pipeline crashed: {str(e)}")

# =====================================================================
# 7. CHAT HISTORY ROUTE STREAM LOGS & CLEAN SLATE WIPING
# =====================================================================
@app.get("/api/history")
async def get_chat_history(user_id: str = Depends(get_current_user_id)):
    cursor = chats_collection.find({"user_id": user_id}).sort("timestamp", 1)
    return [{"query": doc["query"], "response": doc["response"]} for doc in cursor]

@app.delete("/api/history/clear")
async def clear_user_chat_history(user_id: str = Depends(get_current_user_id)):
    try:
        result = chats_collection.delete_many({"user_id": user_id})
        return {"status": "success", "deleted_count": result.deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to wipe collection nodes: {str(e)}")