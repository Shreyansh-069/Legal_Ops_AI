from langchain_google_genai import ChatGoogleGenerativeAI

# Initialize low-temperature Gemini model for deterministic language parsing
llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite", temperature=0.1)

def detect_language(text: str) -> str:
    """Identifies the native language of the client's case query."""
    prompt = f"Analyze the following text and reply with ONLY the ISO language code (e.g., 'en', 'hi', 'ta', 'te', 'mr'): '{text}'"
    response = llm.invoke(prompt)
    return response.content.strip().lower()

def translate_text(text: str, target_lang: str) -> str:
    """Translates the compiled legal advisory text to match the user's language node."""
    if target_lang == "en":
        return text
    prompt = f"Translate the following legal text accurately into the language code '{target_lang}'. Retain the professional formatting, headings, and clean structure:\n\n{text}"
    response = llm.invoke(prompt)
    return response.content.strip()