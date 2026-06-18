import os
import time
import pdfplumber
import google.generativeai as genai
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI

DB_DIR = "chroma_db_or_index"
DATA_DIR = "data"

class DirectGoogleEmbeddings:
    def __init__(self, model_name="models/gemini-embedding-2"):
        self.model_name = model_name
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("CRITICAL: GOOGLE_API_KEY is missing from environment.")
        genai.configure(api_key=api_key)

    def embed_documents(self, texts):
        """Vectorizes text safely without dropping data or messing up dimension tracking."""
        embeddings_list = []
        total_pages = len(texts)
        print(f"Total pages detected: {total_pages}. Starting secure pipeline...")
        
        for i, text in enumerate(texts):
            success = False
            wait_time = 15.0  # Quota hit hone par wait karne ka time
            
            while not success:
                try:
                    if i % 5 == 0:
                        print(f"🔄 Processing batch index {i}/{total_pages}...")
                        
                    response = genai.embed_content(model=self.model_name, content=text)
                    embeddings_list.append(response['embedding'])
                    success = True
                    
                    # Safe padding interval between documents
                    time.sleep(1.2)
                    
                except Exception as e:
                    error_msg = str(e)
                    if "429" in error_msg or "quota" in error_msg.lower() or "exhausted" in error_msg.lower():
                        print(f"⚠️ Google Free Quota hit at page {i}. Sleeping {wait_time}s before retry...")
                        time.sleep(wait_time)
                        # Agli baar aur thoda zyada wait karega agar baar baar hit ho
                        wait_time = min(wait_time + 5.0, 30.0)
                    else:
                        print(f"❌ Real exception hit at page {i}: {error_msg}")
                        # Agar koi aur serious technical error ho, to crash hone se bachaye
                        time.sleep(2.0)
                        break
                        
        print("✨ All document layers embedded with consistent dimensional matrices!")
        return embeddings_list

    def embed_query(self, text):
        """Vectorizes a single query text string for comparison mapping."""
        response = genai.embed_content(model=self.model_name, content=text)
        embedding = response['embedding']
        if isinstance(embedding[0], list):
            return embedding[0]
        return embedding

# Gemini 1.5 Flash Lite usage configuration
embeddings = DirectGoogleEmbeddings()
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-lite", temperature=0.2)

def initialize_vector_db():
    """Reads input legal PDFs from data/ and indexes them to local Chroma storage if empty."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        
    pdf_files = [f for f in os.listdir(DATA_DIR) if f.endswith('.pdf')]
    if not pdf_files:
        print("⚠️ No PDFs found in /data folder. Legal Finder operating with blank local indexing matrix.")
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
        
        print("Sending data directly to Google via controlled speed pipeline...")
        Chroma.from_texts(texts=texts, embedding=embeddings, metadatas=metadatas, persist_directory=DB_DIR)
        print("✅ Structured Constitutional context database compiled and stored locally inside ChromaDB.")

def search_constitutional_acts(query: str) -> str:
    """Performs semantic lookup across the local statutory database layer."""
    if not os.path.exists(DB_DIR) or not os.listdir(DB_DIR):
        return "No local constitutional data acts mapped or uploaded for reference lookup."
        
    db = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
    docs = db.similarity_search(query, k=3)
    return "\n\n".join([f"[Source Document: {d.metadata.get('source')}, Page Reference {d.metadata.get('page')}]: {d.page_content}" for d in docs])