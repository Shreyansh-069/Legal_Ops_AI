from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agents.graph import legal_ops_graph
from agents.legal_finder import initialize_vector_db

app = FastAPI(title="LegalOps AI Core Engine Terminal")

# Avoid cross-origin web tracking blocks from localhost connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LegalRequest(BaseModel):
    query: str

class ChatRequest(BaseModel):
    query: str
    language: str = None

@app.on_event("startup")
def startup_event():
    """Startup event hook for the FastAPI backend server."""
    print("LegalOps Core Engine API server started successfully.")

@app.post("/api/query-legal-ops")
async def process_legal_ops(payload: LegalRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Grievance string parameter empty.")
    try:
        # Initialize an empty processing matrix configuration
        execution_input = {
            "raw_query": payload.query,
            "language": "en",
            "constitutional_data": "",
            "web_data": "",
            "compiled_english_advice": "",
            "final_localized_response": ""
        }
        output = legal_ops_graph.invoke(execution_input)
        return {
            "language": output.get("language"),
            "response": output.get("final_localized_response")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def chat_legal_ops(payload: ChatRequest):
    if not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query string parameter empty.")
    try:
        execution_input = {
            "raw_query": payload.query,
            "language": payload.language or "en",
            "constitutional_data": "",
            "web_data": "",
            "compiled_english_advice": "",
            "final_localized_response": ""
        }
        output = legal_ops_graph.invoke(execution_input)
        return {
            "language": output.get("language"),
            "response": output.get("final_localized_response")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Initializing and compiling the Local Vector Database...")
    initialize_vector_db()
    print("Database initialization task completed successfully.")