import os
from tavily import TavilyClient

def lookup_live_precedents(case_description: str) -> str:
    """Triggers the live external web search agent to pull relevant case decisions."""
    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        return "Tavily API operational routing token missing. Real-time judgment verification bypassed."
        
    tavily = TavilyClient(api_key=api_key)
    query = f"Supreme Court of India judgment precedent decision case law: {case_description[:120]}"
    try:
        search_results = tavily.search(query=query, max_results=2)
        return "\n".join([f"Source: {r['url']}\nContext Summary: {r['content']}" for r in search_results['results']])
    except Exception:
        return "Web search gateway exception encountered. Live judgment extraction halted."