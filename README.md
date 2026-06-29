# LegalOpsAI

LegalOpsAI is a chat assistant designed to help with Indian legal queries. It lets users ask questions, search through local statutory PDF files (like the Constitution of India, the Indian Penal Code, or the new Bharatiya Nyaya Sanhita), and find recent Supreme Court judgments online. The assistant also automatically detects the user's language and translates replies back to them (supporting Hindi, Tamil, Telugu, Kannada, Malayalam, and English).

---

## What It Does (Core Features)

*   **Smart Legal Search (RAG):** Automatically searches through legal PDF manuals stored in the backend folder using semantic search.
*   **Web Judgment Lookup:** Automatically searches the web using Tavily to find relevant Indian Supreme Court case precedents.
*   **Indian Law Guardrails:** The assistant checks if your question is related to Indian laws or court procedures. If you ask something completely unrelated (like sports or pop culture), it politely declines to answer.
*   **Multi-language Support:** Automatically detects the language you ask in and translates the final answer back to that language.
*   **Email OTP Logins:** A simple, passwordless sign-in flow that sends verification codes to your email.
*   **Persistent Chats:** Saves your conversations and messages to MongoDB so you can log back in and resume where you left off.
*   **Theme Switcher:** Clean dark and light modes.

---

## Technical Stack

### Backend
*   **FastAPI:** Serves the backend API.
*   **LangGraph & LangChain:** Manages the logical flow of the AI assistant (language detection -> search -> answer generation -> translation).
*   **ChromaDB:** A local vector database used to index and search through the legal PDF documents.
*   **SentenceTransformers (`all-MiniLM-L6-v2`):** Generates embeddings for local documents.
*   **Motor & Pymongo:** Connects asynchronously to MongoDB.
*   **Google Gemini API:** Powers the main reasoning and translation steps.
*   **Tavily API:** Runs live web searches for legal precedents.

### Frontend
*   **React 19 & Vite:** A fast frontend build system.
*   **Tailwind CSS (v4):** Used for styles.
*   **Lucide Icons:** Icons for the navigation bar and buttons.
*   **React Router Dom:** Handles navigation between the landing page, login page, and chat application.

---

## How it Works Under the Hood

When you send a message, the backend runs a **LangGraph workflow** with these steps:

```mermaid
graph TD
    Start([User Message]) --> Router[1. Router: Detects query language]
    Router --> DocFinder[2a. Doc Finder: Searches indexed PDFs in local ChromaDB]
    Router --> WebSearch[2b. Web Search: Searches recent Indian judgements via Tavily]
    DocFinder --> Synthesis[3. Synthesis: Combines results & Gemini answers query. Rejects if not law-related.]
    WebSearch --> Synthesis
    Synthesis --> Localization[4. Localization: Translates response back to user's language]
    Localization --> End([Final Response to User])
```

1.  **Router:** Detects what language the query is written in.
2.  **Document Finder & Web Search (In Parallel):**
    *   *Document Finder* retrieves relevant sections from the PDFs in `backend/data/`.
    *   *Web Search* searches Google/Tavily for Supreme Court precedents.
3.  **Synthesis:** Combines the text from your local PDFs and the web. Gemini reads this context and answers. If the query isn't about law, a guardrail triggers and the assistant refuses to answer.
4.  **Localization:** Translates the answer back to your language if you didn't write the query in English.

---

## Folder Structure

```text
├── backend/
│   ├── agents/            # AI logic, LangGraph flow, search, and translation
│   ├── auth/              # Email OTP verification, JWT login, and security
│   ├── chat/              # Database models and routers to handle chats/conversations
│   ├── data/              # Put your legal PDFs here to index them (IPC, BNS, Constitution)
│   ├── database/          # MongoDB connection code
│   ├── scripts/           # Simple test scripts for email and authentication
│   ├── main.py            # FastAPI main application file
│   └── requirements.txt   # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── api/           # API fetch wrappers to talk to the backend
│   │   ├── components/    # Reusable UI parts (ChatWindow, Sidebar, etc.)
│   │   ├── context/       # Global contexts (Auth, Theme)
│   │   ├── pages/         # Full pages (Landing, Login, Signup, ChatApp)
│   │   ├── App.jsx        # Main application router
│   │   └── index.css      # Core styles and custom Tailwind setups
│   └── package.json       # Frontend dependencies
└── docker-compose.yml     # Sets up local MongoDB
```

---

## Getting Started

### Prerequisites
Make sure you have these installed on your computer:
*   [Python 3.10+](https://www.python.org/downloads/)
*   [Node.js](https://nodejs.org/)
*   [Docker](https://www.docker.com/products/docker-desktop/) (to run MongoDB locally)

---

### Step 1: Start MongoDB
In the root folder of this project, run this command in your terminal to start MongoDB:
```bash
docker compose up -d
```
*This starts a MongoDB container on port `27017` and keeps your database data inside a local volume.*

---

### Step 2: Set Up the Backend

1.  Open your terminal and navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Create a copy of `.env.example` and name it `.env`:
    *   On Windows (PowerShell):
        ```powershell
        cp .env.example .env
        ```
    *   On macOS/Linux:
        ```bash
        cp .env.example .env
        ```
3.  Open the newly created `.env` file and fill in your keys:
    *   `GOOGLE_API_KEY`: Your Gemini API key from Google AI Studio.
    *   `TAVILY_API_KEY`: Your search API key from Tavily.
    *   `MAIL_USERNAME` and `MAIL_PASSWORD`: Your SMTP email credentials (like a Gmail App Password) to send verification OTP emails.
4.  Create a Python virtual environment:
    ```bash
    python -m venv venv
    ```
5.  Activate the virtual environment:
    *   On Windows (PowerShell):
        ```powershell
        .\venv\Scripts\Activate.ps1
        ```
    *   On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```
6.  Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```
7.  **Initialize the Vector Database:**
    Before launching the API server, run `main.py` directly once. This will read the PDF files inside the `backend/data/` folder and index them into a new folder called `chroma_db_or_index/`:
    ```bash
    python main.py
    ```
8.  Start the FastAPI server:
    ```bash
    uvicorn main:app --reload
    ```
    *The API will run on `http://localhost:8000`.*

---

### Step 3: Set Up the Frontend

1.  Open a new terminal window and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install the packages:
    ```bash
    npm install
    ```
3.  Start the Vite development server:
    ```bash
    npm run dev
    ```
4.  Open `http://localhost:5173` in your web browser.

---

## Testing SMTP & Authentication

If you need to test your settings, we've included two scripts inside `backend/scripts/`:

*   **Test SMTP Email sending:**
    Runs a test to ensure your SMTP server settings in `.env` are working.
    ```bash
    # From the backend directory with venv active
    python scripts/test_email_config.py
    ```
*   **Test Auth endpoints:**
    Starts a quick API smoke test for authentication and chat lists.
    ```bash
    # From the backend directory with venv active
    python scripts/test_auth.py
    ```
