from langchain_google_genai import ChatGoogleGenerativeAI

_llm = None

def get_llm():
    global _llm
    if _llm is None:
        import os
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is missing from environment. Please add it to your .env file.")
        _llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite", temperature=0.1, google_api_key=api_key)
    return _llm

def extract_text(content) -> str:
    """Safely extracts a string content from LangChain's response (which can be a string or a list of parts)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        text_parts = []
        for part in content:
            if isinstance(part, dict):
                text_parts.append(part.get("text", ""))
            elif isinstance(part, str):
                text_parts.append(part)
            elif hasattr(part, "text"):
                text_parts.append(part.text)
            elif hasattr(part, "get"):
                text_parts.append(part.get("text", ""))
        return "".join(text_parts)
    return str(content)

def detect_language(text: str) -> str:
    """Identifies the native language of the client's case query."""
    prompt = f"Analyze the following text and reply with ONLY the ISO language code (e.g., 'en', 'hi', 'ta', 'te', 'mr'): '{text}'"
    llm = get_llm()
    response = llm.invoke(prompt)
    return extract_text(response.content).strip().lower()

def translate_text(text: str, target_lang: str) -> str:
    """Translates the compiled legal advisory text to match the user's language node."""
    if target_lang == "en":
        return text
    prompt = f"Translate the following legal text accurately into the language code '{target_lang}'. Retain the professional formatting, headings, and clean structure:\n\n{text}"
    llm = get_llm()
    response = llm.invoke(prompt)
    return extract_text(response.content).strip()