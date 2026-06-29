import os
import asyncio
import pdfplumber
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Try to find and load the .env file in multiple possible locations
if os.path.exists(".env"):
    load_dotenv(".env")
elif os.path.exists("backend/.env"):
    load_dotenv("backend/.env")
elif os.path.exists("../.env"):
    load_dotenv("../.env")
else:
    load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "legal_ops_ai")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

async def main():
    if not MONGODB_URI:
        print("[ERROR] MONGODB_URI is not set in the environment or .env file.")
        return
    if not GOOGLE_API_KEY:
        print("[ERROR] GOOGLE_API_KEY is not set in the environment or .env file.")
        return
        
    print(f"Connecting to MongoDB database: {MONGODB_DB_NAME}...")
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[MONGODB_DB_NAME]
    
    # Initialize Google GenAI Embeddings (using the same model we will query with)
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=GOOGLE_API_KEY)
    
    # Determine the correct directory for PDFs
    if os.path.exists("data"):
        data_dir = "data"
    elif os.path.exists("backend/data"):
        data_dir = "backend/data"
    else:
        print("[ERROR] Could not find the 'data' or 'backend/data' directory containing PDF files.")
        return
        
    pdf_files = [f for f in os.listdir(data_dir) if f.endswith('.pdf')]
    if not pdf_files:
        print(f"[WARNING] No PDF files found in '{data_dir}' directory.")
        return
        
    documents = []
    print(f"Found PDF files for indexing: {pdf_files}")
    for pdf in pdf_files:
        pdf_path = os.path.join(data_dir, pdf)
        print(f"Extracting text from {pdf}...")
        try:
            with pdfplumber.open(pdf_path) as pdf_doc:
                for i, page in enumerate(pdf_doc.pages):
                    text = page.extract_text()
                    if text and text.strip():
                        documents.append({
                            "text": text.strip(),
                            "source": pdf,
                            "page": i + 1
                        })
        except Exception as e:
            print(f"[ERROR] Failed to read {pdf}: {e}")
            
    if not documents:
        print("[WARNING] No text content could be extracted from the PDFs.")
        return
        
    print(f"Extracted a total of {len(documents)} pages. Uploading to MongoDB Atlas collection 'legal_acts'...")
    
    # Clear any old documents from the collection
    print("Clearing 'legal_acts' collection in MongoDB...")
    await db.legal_acts.delete_many({})
    
    # Process and embed the documents
    for idx, doc in enumerate(documents):
        print(f"[{idx+1}/{len(documents)}] Embedding and uploading page {doc['page']} of {doc['source']}...")
        
        # Prevent hitting rate limits with a small delay
        await asyncio.sleep(0.3)
        
        retries = 3
        success = False
        while retries > 0 and not success:
            try:
                # Generate vector embedding for the text chunk
                embedding = await embeddings.aembed_query(doc["text"])
                doc["embedding"] = embedding
                
                # Save document to Atlas
                await db.legal_acts.insert_one(doc)
                success = True
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "exhausted" in err_str.lower() or "quota" in err_str.lower():
                    print(f"  [RATE LIMIT] Rate limit or quota hit. Retrying in 6 seconds... ({retries} retries left)")
                    await asyncio.sleep(6)
                    retries -= 1
                else:
                    print(f"[ERROR] Failed to embed/upload document page {doc['page']} of {doc['source']}: {e}")
                    break

            
    print("\n[SUCCESS] All legal act documents have been successfully indexed and uploaded to MongoDB Atlas!")
    print("Next step: Please remember to create the Vector Search Index named 'vector_index' in your MongoDB Atlas UI.")

if __name__ == "__main__":
    asyncio.run(main())
