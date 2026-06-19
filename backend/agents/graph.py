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

def document_finder_node(state: LegalState):
    doc_context = search_constitutional_acts(state["raw_query"])
    return {"constitutional_data": doc_context}

def web_lookup_node(state: LegalState):
    live_context = lookup_live_precedents(state["raw_query"])
    return {"web_data": live_context}

def synthesis_node(state: LegalState):
    prompt = f"""
    You are an enterprise LegalOps reasoning model for India. Combine these inputs:
    - User Dispute Profile: {state['raw_query']}
    - Local Grounded Constitutional Acts: {state['constitutional_data']}
    - Live Web Search Judgements: {state['web_data']}
    
    Synthesize a completely objective, non-hallucinated Legal Advisory response structured exactly as follows:
    1. YOUR CONSTITUTIONAL RIGHTS (Written in clear, consumer-friendly lay terms)
    2. STATUTORY COMPLIANCE (Relevant IPC/BNS sections or Bare Act clauses mapped out)
    3. RECOMMENDED STRATEGY (Actionable legal recourses, police filing tips, or legal notice paths)
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