import os
import pdfplumber
import shutil
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

DB_DIR = "chroma_db_or_index"
DATA_DIR = "data"

# Initialize fast local embeddings using SentenceTransformers
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def initialize_vector_db():
    """Reads input legal PDFs from data/ and indexes them to local Chroma storage if empty or incompatible."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    # Check if DB already exists and verify it is compatible
    if os.path.exists(DB_DIR) and os.listdir(DB_DIR):
        try:
            # Try performing a dummy similarity search to check dimension compatibility (384 for all-MiniLM-L6-v2)
            db = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
            db.similarity_search("test", k=1)
            print("[SUCCESS] Structured Constitutional context database already exists and is compatible. Skipping initialization.")
            return
        except Exception as e:
            print(f"[WARNING] Existing Chroma database is incompatible or corrupted ({e}). Rebuilding...")
            try:
                shutil.rmtree(DB_DIR)
            except Exception as delete_err:
                print(f"[WARNING] Could not delete database folder: {delete_err}")
        
    pdf_files = [f for f in os.listdir(DATA_DIR) if f.endswith('.pdf')]
    if not pdf_files:
        print("[WARNING] No PDFs found in /data folder. Legal Finder operating with blank local indexing matrix.")
        return
        
    documents = []
    print(f"Found {len(pdf_files)} PDFs. Extracting content text segments...")
    
    for pdf in pdf_files:
        pdf_path = os.path.join(DATA_DIR, pdf)
        with pdfplumber.open(pdf_path) as pdf_doc:
            for i, page in enumerate(pdf_doc.pages):
                text = page.extract_text()
                if text:
                    documents.append({
                        "text": text, 
                        "metadata": {"source": pdf, "page": i + 1}
                    })
                    
    if documents:
        texts = [doc["text"] for doc in documents]
        metadatas = [doc["metadata"] for doc in documents]
        
        print("Indexing documents locally via fast SentenceTransformer pipeline...")
        Chroma.from_texts(texts=texts, embedding=embeddings, metadatas=metadatas, persist_directory=DB_DIR)
        print("[SUCCESS] Structured Constitutional context database compiled and stored locally inside ChromaDB.")

def search_constitutional_acts(query: str) -> str:
    """Performs semantic lookup across the local statutory database layer."""
    if not os.path.exists(DB_DIR) or not os.listdir(DB_DIR):
        return "No local constitutional data acts mapped or uploaded for reference lookup."
        
    try:
        db = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
        docs = db.similarity_search(query, k=3)
    except Exception as e:
        print(f"[WARNING] Vector database error during search (likely dimension mismatch): {e}. Re-initializing database...")
        if os.path.exists(DB_DIR):
            try:
                shutil.rmtree(DB_DIR)
            except Exception as delete_err:
                print(f"[WARNING] Could not delete database folder during search error recovery: {delete_err}")
        initialize_vector_db()
        
        if not os.path.exists(DB_DIR) or not os.listdir(DB_DIR):
            return "No local constitutional data acts mapped or uploaded for reference lookup after re-initialization."
        db = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
        docs = db.similarity_search(query, k=3)
        
    return "\n\n".join([f"[Source Document: {d.metadata.get('source')}, Page Reference {d.metadata.get('page')}]: {d.page_content}" for d in docs])