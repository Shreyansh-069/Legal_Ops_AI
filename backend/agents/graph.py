from typing import TypedDict, List
from langgraph.graph import StateGraph, START, END
from agents.translator import detect_language, translate_text, extract_text
from agents.legal_finder import search_constitutional_acts
from agents.web_search import lookup_live_precedents
from langchain_google_genai import ChatGoogleGenerativeAI

# The state dictionary shared across nodes
class LegalState(TypedDict):
    raw_query: str
    language: str
    constitutional_data: str
    web_data: str
    compiled_english_advice: str
    final_localized_response: str

_llm = None

def get_llm():
    global _llm
    if _llm is None:
        import os
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY is missing from environment. Please add it to your .env file.")
        _llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite", temperature=0.3, google_api_key=api_key)
    return _llm

def routing_node(state: LegalState):
    lang = detect_language(state["raw_query"])
    return {"language": lang}

async def document_finder_node(state: LegalState):
    doc_context = await search_constitutional_acts(state["raw_query"])
    return {"constitutional_data": doc_context}

def web_lookup_node(state: LegalState):
    live_context = lookup_live_precedents(state["raw_query"])
    return {"web_data": live_context}

def synthesis_node(state: LegalState):
    prompt = f"""
    You are an expert enterprise LegalOps reasoning model for India. Your absolute priority is handling Indian legal matters, procedures, and statutory compliance.

    Inputs available to you:
    - User Query: {state['raw_query']}
    - Local Grounded Constitutional Acts: {state['constitutional_data']}
    - Live Web Search Judgements: {state['web_data']}
    
    CRITICAL SCOPE ENFORCEMENT (GUARDRAIL):
    - First, evaluate if the User Query is related to legal advice, Indian statutes, court procedures, documentation, or legal disputes.
    - If the query is COMPLETELY UNRELATED to law (e.g., sports, general knowledge trivia, pop culture, entertainment, or casual chat), you MUST politely refuse to answer it. 
    - When refusing, explain clearly and professionally what this system is designed to do. 
      Example refusal tone: "I am an AI assistant specialized in Indian Legal Operations. I can help you with legal disputes, statutory compliance, or procedural queries like filing an FIR, but I cannot answer unrelated general trivia or sports questions. Please let me know how I can assist you with your legal needs."

    IF THE QUERY IS LEGALLY RELEVANT, PROCEED WITH THE FOLLOWING RULES:
    1. NEVER include internal routing language, labels, or case tags (e.g., Do NOT output "Handling Case 3" or "Okay this is case 3"). Jump straight into the natural answer.
    2. Adapt your tone and structure completely to the nature of the legal query:
       - For Procedural/How-To Requests (e.g., "What statement do I give in an FIR?"): Provide direct, actionable, conversational guidance starting naturally (e.g., "In an FIR, your statement should include..."). Do not force a rigid layout.
       - For Complex Disputes/Case Assessments: Organize the response using clean markdown headings:
         ### 1. YOUR CONSTITUTIONAL RIGHTS
         ### 2. STATUTORY COMPLIANCE
         ### 3. RECOMMENDED STRATEGY
       - For General Legal Follow-ups/Clarifications: Provide a fluid, direct, professional conversational answer without formal headers.
    """
    
    llm = get_llm()
    response = llm.invoke(prompt)
    return {"compiled_english_advice": extract_text(response.content).strip()}

def final_localization_node(state: LegalState):
    localized = translate_text(state["compiled_english_advice"], state["language"])
    return {"final_localized_response": localized}

# Map layout logic to the state graph builder
builder = StateGraph(LegalState)

# Node registration
builder.add_node("router", routing_node)
builder.add_node("doc_finder", document_finder_node)
builder.add_node("web_search", web_lookup_node)
builder.add_node("synthesis", synthesis_node)
builder.add_node("localization", final_localization_node)

# Flow architecture connections (Parallel search tracking)
builder.add_edge(START, "router")
builder.add_edge("router", "doc_finder")
builder.add_edge("router", "web_search")
builder.add_edge("doc_finder", "synthesis")
builder.add_edge("web_search", "synthesis")
builder.add_edge("synthesis", "localization")
builder.add_edge("localization", END)

legal_ops_graph = builder.compile()