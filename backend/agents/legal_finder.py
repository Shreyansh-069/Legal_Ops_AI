import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from database.mongodb import get_database

# Initialize Google GenAI Embeddings using the text-embedding-004 model.
# It automatically reads GOOGLE_API_KEY from the environment.
embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")

def initialize_vector_db():
    """Dummy initialization function to maintain compatibility with main.py.
    The database indexing is now done via the index_to_atlas.py script.
    """
    print("[INFO] MongoDB Atlas Vector Search initialization bypassed. "
          "Use the script 'backend/scripts/index_to_atlas.py' to index files to Atlas.")

async def search_constitutional_acts(query: str) -> str:
    """Performs semantic lookup across the MongoDB Atlas Vector Search layer."""
    try:
        db = get_database()
    except RuntimeError as e:
        print(f"[WARNING] Database connection error: {e}")
        return "No local constitutional data acts mapped or uploaded for reference lookup."

    try:
        # Generate query vector using Google GenAI embeddings
        query_vector = await embeddings.aembed_query(query)
    except Exception as e:
        print(f"[ERROR] Failed to generate query embedding: {e}")
        return "Vector database error during embedding generation."

    collection = db["legal_acts"]
    
    # Run the Atlas Vector Search aggregation pipeline
    # The search index in Atlas is expected to be named "vector_index"
    pipeline = [
        {
            "$vectorSearch": {
                "index": "vector_index",
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": 100,
                "limit": 3
            }
        }
    ]

    try:
        cursor = collection.aggregate(pipeline)
        docs = await cursor.to_list(length=3)
    except Exception as e:
        print(f"[ERROR] Atlas Vector Search failed: {e}. Make sure a vector index named 'vector_index' is configured in MongoDB Atlas.")
        return "No local constitutional data acts mapped or uploaded for reference lookup due to vector search indexing issues."

    if not docs:
        return "No relevant constitutional acts found in the database."

    return "\n\n".join([
        f"[Source Document: {d.get('source', 'Unknown')}, Page Reference {d.get('page', 'N/A')}]: {d.get('text', '')}"
        for d in docs
    ])