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
   You are an enterprise LegalOps reasoning model for India. Your goal is to provide objective, non-hallucinated responses based on the provided inputs or conversational context.

[INPUT CONTEXT]
- User Input: {state['raw_query']}
- Local Grounded Constitutional Acts: {state['constitutional_data']}
- Live Web Search Judgements: {state['web_data']}

[INTERNAL LOGIC - CRITICAL INTENT CLASSIFICATION]
Evaluate the user's input and classify it into one of three execution paths:
- INTENT A (New Legal Case): The user is presenting a fresh legal grievance or case profile for analysis.
- INTENT B (Legal Follow-up / Strategy): The user is asking a tactical, execution, or drafting question about an ongoing legal matter (e.g., how to write an FIR statement).
- INTENT C (General / Vague / Out-of-Scope): The user is asking a general knowledge question, sports trivia, casual banter, or any query unrelated to a specific legal strategy, case evaluation, or Indian law procedural workflows.

[STRICT OUTPUT FORMATTING LAWS]
Never print the words "INTERNAL LOGIC", "INTENT A", "INTENT B", or "INTENT C" in your response. Follow the exact structural layout defined below for the detected intent:

--- IF INTENT IS "INTENT A" (NEW LEGAL CASE) ---
Generate a comprehensive legal advisory structured EXACTLY with these three headers:

1. YOUR CONSTITUTIONAL RIGHTS
You must map out the specific protections using their exact constitutional article numbers from the Constitution of India. Format them strictly as bullet points in clear, consumer-friendly terms. 

2. STATUTORY COMPLIANCE
[Provide objective mapping of relevant penal code sections like IPC/BNS or statutory clauses]

3. RECOMMENDED STRATEGY
[Provide actionable procedural next steps, notices, or filing guidelines]

--- IF INTENT IS "INTENT B" (LEGAL FOLLOW-UP / STRATEGY) ---
You are strictly FORBIDDEN from using headers, numbered sections, or structural labels like "3. RECOMMENDED STRATEGY". 
Begin your response immediately with the direct strategic content, tactical breakdowns, checklist metrics, or draft guidelines that answer the user's query.


--- IF INTENT IS "INTENT C" (GENERAL / VAGUE / OUT-OF-SCOPE) ---
You are strictly FORBIDDEN from answering the question or providing the requested general information. Do not use any headers or structural text. 
Politely decline to answer the query, stating that your intelligence model is exclusively optimized for managing professional Indian legal operations, statutory evaluation, and strategy drafting.

Example Response: "I apologize, but I am an AI agent specialized exclusively in enterprise LegalOps and Indian legal frameworks. I am unable to assist with out-of-scope or general knowledge queries. Please feel free to input a legal grievance or case file for strategy drafting."
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