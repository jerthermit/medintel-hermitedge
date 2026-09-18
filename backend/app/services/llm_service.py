import logging
from together import Together
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Together client once
client = None
if settings.TOGETHER_API_KEY:
    try:
        client = Together(api_key=settings.TOGETHER_API_KEY)
    except Exception as e:
        logger.error(f"Failed to initialize Together client: {e}")
        client = None

def _build_synthesis_prompt(query: str, articles: list) -> tuple[str, str]:
    """Helper to construct the prompt and system instructions for both sync and stream modes."""
    prompt_parts = [
        f"RESEARCH QUERY: {query}",
        "\n--- CLINICAL EVIDENCE ---\n",
    ]

    for idx, art in enumerate(articles, start=1):
        title = getattr(art, 'title', art.get('title', 'Unknown Title') if isinstance(art, dict) else 'Unknown Title')
        journal = getattr(art, 'journal', art.get('journal', 'Unknown Journal') if isinstance(art, dict) else 'Unknown Journal')
        abstract = getattr(art, 'abstract', art.get('abstract', '') if isinstance(art, dict) else '')

        safe_abstract = (abstract[:1500] + '...') if len(abstract) > 1500 else abstract
        prompt_parts.append(
            f"SOURCE [{idx}]: {title}\n"
            f"JOURNAL: {journal}\n"
            f"DATAPOINTS: {safe_abstract}\n"
        )

    prompt_parts.append(
        "\n--- MISSION ---\n"
        "Synthesize these abstracts into a structured response for a Chief Medical Officer.\n"
        "You MUST output EXACTLY these four sections in this order, using these exact markdown headers:\n\n"
        "**SEARCH RATIONALE**\n"
        "Provide a 1-2 sentence high-level explanation of why this specific cohort of literature represents the optimal evidence base for the query.\n\n"
        "**INDIVIDUAL EVIDENCE APPRAISAL**\n"
        "For each provided source, write a concise critical appraisal of its core findings. Format strictly as:\n"
        "* **[Source X]:** <Brief, data-driven summary>\n\n"
        "**KEY CLINICAL FINDINGS**\n"
        "Provide 3 to 5 detailed bullet points synthesizing the hard data, p-values, patient outcomes, and measurable metrics across all studies. Do not summarize this into a single sentence.\n\n"
        "**EMERGING THEMES**\n"
        "Provide 2 to 3 bullet points identifying overarching patterns, clinical consensus, or critical contradictions in the literature."
    )

    system_prompt = (
        "You are a Principal Medical Investigator. Your output is for high-level clinical decision support.\n"
        "RULES:\n"
        "1. NO FLUFF. Banned words: 'game-changer', 'revolutionary', 'tapestry', 'unleash', 'delve', 'landscape', 'beacon'.\n"
        "2. DATA FIRST. If an abstract mentions a p-value, confidence interval, or % change, YOU MUST INCLUDE IT.\n"
        "3. HONESTY. If evidence is conflicting, state 'Evidence is conflicting'. Do not force a consensus.\n"
        "4. STRICT STRUCTURE. You must include all four headers exactly as requested. Never skip a section. Never omit the Emerging Themes.\n"
        "5. NO PREAMBLE. Start immediately with **SEARCH RATIONALE**."
    )

    return "\n".join(prompt_parts), system_prompt


def stream_summarize_results(query: str, articles: list):
    """
    World-Class Medical Synthesis (STREAMING):
    Yields synthesis text as it is streamed by the configured Together AI model.
    """
    if not articles:
        yield "No sufficient literature found to synthesize a clinical conclusion."
        return

    if client is None:
        logger.error("Together AI client is not configured.")
        yield "**System Note:** AI synthesis is currently unavailable."
        return

    prompt, system_prompt = _build_synthesis_prompt(query, articles)

    try:
        model_name = settings.LLM_MODEL_ID
        max_tokens = getattr(settings, "LLM_MAX_TOKENS", 2048)

        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            max_tokens=max_tokens,
            temperature=0.1,
            top_p=0.9,
            stream=True  # NATIVE TOKEN STREAMING ENABLED
        )

        for chunk in response:
            if hasattr(chunk, 'choices') and chunk.choices:
                delta = chunk.choices[0].delta
                if hasattr(delta, 'content') and delta.content:
                    yield delta.content

    except Exception as e:
        logger.error("Together AI synthesis stream failed.", exc_info=True)
        yield "\n\n**System Note:** Unable to generate synthesis at this time.\n"


def summarize_results(query: str, articles: list) -> str:
    """
    LEGACY SYNCHRONOUS FUNCTION.
    Kept temporarily to ensure app/api/llm.py does not break until we upgrade it to use SSE.
    """
    if not articles:
        return "No sufficient literature found to synthesize a clinical conclusion."

    if client is None:
        return "**System Note:** AI synthesis is currently unavailable."

    prompt, system_prompt = _build_synthesis_prompt(query, articles)

    try:
        model_name = settings.LLM_MODEL_ID
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            max_tokens=getattr(settings, "LLM_MAX_TOKENS", 2048),
            temperature=0.1,
            top_p=0.9,
        )
        return response.choices[0].message.content

    except Exception as e:
        logger.error("Together AI synthesis failed.", exc_info=True)
        return "**System Note:** Unable to generate synthesis at this time."
