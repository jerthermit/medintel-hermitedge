// File: frontend/src/hooks/useResearch.ts

import { useRef, useState } from 'react';

const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;

  if (import.meta.env.PROD && (!url || url.includes('localhost'))) {
    console.warn('VITE_API_URL is missing or pointing to localhost.');
  }

  return (url || 'http://localhost:8000').replace(/\/+$/, '');
};

export const API_URL = getApiUrl();

export interface Article {
  title: string;
  abstract: string;
  url: string;
  journal: string;
  id: string;
  authors: string[];
  pubDate: string;
}

interface ResearchResponse {
  query: string;
  results: Partial<Article>[];
}

const safeString = (value: unknown, fallback: string) => {
  if (value === null || value === undefined) return fallback;

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : fallback;
};

const safeAuthors = (authors: unknown) => {
  if (!Array.isArray(authors)) return ['Authors not listed'];

  const normalized = authors
    .map((author) => safeString(author, ''))
    .filter(Boolean);

  return normalized.length > 0 ? normalized : ['Authors not listed'];
};

const getResponseMessage = async (response: Response) => {
  if (response.status === 402) {
    return 'The monthly usage limit has been reached. Review is temporarily unavailable.';
  }

  if (response.status === 429) {
    return 'Too many requests were sent in a short period. Please wait briefly before trying again.';
  }

  let message = 'The request could not be completed.';

  try {
    const errorData = await response.json();

    if (response.status === 422 && Array.isArray(errorData.detail)) {
      const validationMessages = errorData.detail
        .map((entry: any) => entry?.msg)
        .filter(Boolean)
        .join(', ');

      return validationMessages
        ? `The request payload was not accepted: ${validationMessages}`
        : 'The request payload was not accepted by the server.';
    }

    if (typeof errorData.detail === 'string' && errorData.detail.trim()) {
      message = errorData.detail.trim();
    }
  } catch (e) {
    // Keep the fallback message when the server does not return JSON.
  }

  return message;
};

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    throw new Error(await getResponseMessage(response));
  }
};

const adaptArticle = (raw: Partial<Article>, index: number): Article => {
  const fallbackId = raw.url ? `source-${index + 1}` : `article-${index + 1}`;

  return {
    title: safeString(raw.title, 'Untitled article'),
    abstract: safeString(raw.abstract, 'Abstract not available.'),
    url: safeString(raw.url, '#'),
    journal: safeString(raw.journal, 'Unknown journal'),
    id: safeString(raw.id || raw.url, fallbackId),
    authors: safeAuthors(raw.authors),
    pubDate: safeString(raw.pubDate, new Date().getFullYear().toString()),
  };
};

export const useResearch = () => {
  const [loading, setLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Article[]>([]);
  const [synthesis, setSynthesis] = useState<string | null>(null);

  const searchRequestIdRef = useRef(0);
  const synthesisRequestIdRef = useRef(0);
  const searchAbortControllerRef = useRef<AbortController | null>(null);
  const synthesisAbortControllerRef = useRef<AbortController | null>(null);

  const search = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    const requestId = searchRequestIdRef.current + 1;
    searchRequestIdRef.current = requestId;

    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    if (synthesisAbortControllerRef.current) {
      synthesisAbortControllerRef.current.abort();
      synthesisAbortControllerRef.current = null;
    }

    const controller = new AbortController();
    searchAbortControllerRef.current = controller;

    setLoading(true);
    setIsSynthesizing(false);
    setError(null);
    setResults([]);
    setSynthesis(null);

    try {
      const response = await fetch(`${API_URL}/api/pubmed/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: trimmedQuery, limit: 5 }),
        signal: controller.signal,
      });

      await handleApiError(response);

      const data: ResearchResponse = await response.json();

      if (requestId !== searchRequestIdRef.current) {
        return;
      }

      const adaptedResults = (data.results || []).map(adaptArticle);
      setResults(adaptedResults);

      if (adaptedResults.length === 0) {
        setError('No matching PubMed articles were found.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }

      if (requestId === searchRequestIdRef.current) {
        setError(
          err instanceof Error
            ? err.message
            : 'The source search could not be completed.'
        );
      }
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setLoading(false);
        searchAbortControllerRef.current = null;
      }
    }
  };

  const synthesize = async (query: string, articles: Article[]) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || articles.length === 0) {
      setError('Load papers before running a review.');
      return;
    }

    const safeQuery =
      trimmedQuery.length < 5 ? `${trimmedQuery} research` : trimmedQuery;

    const requestId = synthesisRequestIdRef.current + 1;
    synthesisRequestIdRef.current = requestId;

    if (synthesisAbortControllerRef.current) {
      synthesisAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    synthesisAbortControllerRef.current = controller;

    setError(null);
    setIsSynthesizing(true);
    setSynthesis('');

    try {
      const payloadArticles = articles.map((article, index) => ({
        id: safeString(article.id, `article-${index + 1}`),
        title: safeString(article.title, 'Untitled article'),
        abstract: safeString(article.abstract, 'Abstract not available.'),
        journal: safeString(article.journal, 'Unknown journal'),
        url: safeString(article.url, 'https://pubmed.ncbi.nlm.nih.gov/'),
        authors: safeAuthors(article.authors),
        pubDate: safeString(article.pubDate, 'n.d.'),
      }));

      const response = await fetch(`${API_URL}/api/llm/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: safeQuery,
          articles: payloadArticles,
        }),
        signal: controller.signal,
      });

      await handleApiError(response);

      if (!response.body) {
        throw new Error('The browser could not open the review stream.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      // Streams textual tokens returned by the configured Together AI model
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          const finalChunk = decoder.decode();

          if (finalChunk) {
            accumulatedText += finalChunk;
          }

          break;
        }

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          if (requestId === synthesisRequestIdRef.current) {
            setSynthesis(accumulatedText);
          }
        }
      }

      if (requestId === synthesisRequestIdRef.current) {
        setSynthesis(accumulatedText);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        if (requestId === synthesisRequestIdRef.current) {
          setSynthesis((prev) => (prev && prev.trim() ? prev : null));
        }

        return;
      }

      if (requestId === synthesisRequestIdRef.current) {
        const message =
          err instanceof Error
            ? err.message
            : 'The review could not be completed.';

        setSynthesis((prev) =>
          prev && prev.trim()
            ? `${prev}\n\n**Review note:** The review was interrupted. ${message}`
            : `**Review note:** The review could not be completed. ${message}`
        );
      }
    } finally {
      if (requestId === synthesisRequestIdRef.current) {
        setIsSynthesizing(false);
        synthesisAbortControllerRef.current = null;
      }
    }
  };

  const stopSynthesis = () => {
    if (synthesisAbortControllerRef.current) {
      synthesisAbortControllerRef.current.abort();
      synthesisAbortControllerRef.current = null;
    }

    synthesisRequestIdRef.current += 1;
    setIsSynthesizing(false);
    setSynthesis((prev) => (prev && prev.trim() ? prev : null));
  };

  return {
    loading,
    isSynthesizing,
    error,
    results,
    synthesis,
    search,
    synthesize,
    stopSynthesis,
  };
};
