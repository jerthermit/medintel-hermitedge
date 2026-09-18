import logging
from Bio import Entrez
from app.core.config import settings
from app.models.research import Article

logger = logging.getLogger(__name__)

# --- CONFIGURATION & PLUG-AND-PLAY SAFETY ---
# NCBI requires an email. If the user hasn't set one in .env, we use a fallback
# to ensure the demo doesn't crash immediately.
Entrez.email = settings.PUBMED_EMAIL or None

# Optional: Use API Key for higher rate limits (10 req/s vs 3 req/s)
if settings.PUBMED_API_KEY:
    Entrez.api_key = settings.PUBMED_API_KEY

def search_articles(query: str, max_results: int = 10) -> list[Article]:
    """
    Searches PubMed for articles matching the query.

    Robustness:
    - Handles network errors gracefully.
    - Parses XML responses safely.
    - Returns structured 'Article' objects.
    """
    if not query:
        return []

    try:
        # 1. Search for IDs
        logger.info(f"Searching PubMed for: {query}")
        handle = Entrez.esearch(
            db="pubmed",
            term=query,
            retmax=max_results,
            sort="date" # Changed from 'relevance' to 'date' for latest scientific evidence
        )
        record = Entrez.read(handle)
        handle.close()

        id_list = record.get("IdList", [])

        if not id_list:
            logger.info("No articles found.")
            return []

        # 2. Fetch Details for IDs
        # retmode='xml' ensures we get structured data we can parse
        handle = Entrez.efetch(
            db="pubmed",
            id=",".join(id_list),
            retmode="xml"
        )
        papers = Entrez.read(handle)
        handle.close()

        # 3. Transform to Domain Models
        articles = []
        # 'PubmedArticle' is usually the key, but sometimes it's 'PubmedBookArticle'
        # We focus on standard articles for this demo.
        pubmed_articles = papers.get("PubmedArticle", [])

        for paper in pubmed_articles:
            try:
                article_data = paper["MedlineCitation"]["Article"]
                journal_info = article_data.get("Journal", {})

                # Extract basic fields safely
                title = article_data.get("ArticleTitle", "No Title")
                journal = journal_info.get("Title", "Unknown Journal")

                # Extract Abstract (can be a list of parts or a string)
                abstract_raw = article_data.get("Abstract", {}).get("AbstractText", [])
                if isinstance(abstract_raw, list):
                    abstract = " ".join([str(part) for part in abstract_raw])
                else:
                    abstract = str(abstract_raw)

                # Extract Publication Date
                try:
                    pub_date_dict = journal_info.get("JournalIssue", {}).get("PubDate", {})
                    year = pub_date_dict.get("Year", "")
                    month = pub_date_dict.get("Month", "")
                    pub_date = f"{year} {month}".strip() or "N/A"
                except:
                    pub_date = "N/A"

                # Extract Authors
                author_list_raw = article_data.get("AuthorList", [])
                authors = []
                for author in author_list_raw:
                    if "LastName" in author:
                        name = f"{author.get('LastName', '')} {author.get('Initials', '')}".strip()
                        if name:
                            authors.append(name)
                    elif "CollectiveName" in author:
                        authors.append(str(author.get("CollectiveName", "")))

                # Construct URL
                pmid = paper["MedlineCitation"]["PMID"]
                url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"

                articles.append(Article(
                    id=str(pmid),
                    title=str(title),
                    abstract=str(abstract) if abstract else "No abstract available.",
                    journal=str(journal),
                    authors=authors,
                    pubDate=str(pub_date),
                    url=url
                ))
            except Exception as e:
                logger.warning(f"Failed to parse a paper: {e}")
                continue

        return articles

    except Exception:
        logger.error("PubMed API request failed.", exc_info=True)
        raise
