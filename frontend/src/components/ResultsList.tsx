import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Link,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  ContentCopy as CopyIcon,
  FactCheck as AppraisalIcon,
  OpenInNew as ExternalLinkIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { API_URL, Article } from '../hooks/useResearch';

interface ResultsListProps {
  results: Article[];
}

type AnalysisState = {
  loading: boolean;
  data: string | null;
  error: string | null;
  isOpen: boolean;
};

type EvidenceBadge = {
  label: string;
  tone?: 'teal' | 'purple' | 'red';
};

const stripHtmlTags = (str: string) => {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '');
};

const isEpubAheadOfPrint = (dateString: string) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const match = dateString.match(/(\d{4})(?:\s+([a-zA-Z]+))?/);

    if (match) {
      const pubYear = parseInt(match[1], 10);
      const monthName = match[2];

      if (pubYear > currentYear) return true;

      if (pubYear === currentYear && monthName) {
        const months = [
          'jan',
          'feb',
          'mar',
          'apr',
          'may',
          'jun',
          'jul',
          'aug',
          'sep',
          'oct',
          'nov',
          'dec',
        ];

        const pubMonth = months.findIndex((month) =>
          monthName.toLowerCase().startsWith(month)
        );

        if (pubMonth > currentMonth) return true;
      }
    }
  } catch (e) {
    return false;
  }

  return false;
};

const formatAbstract = (text: string, limit: number) => {
  if (!text) return 'Abstract not available from publisher.';

  let result = text;
  let isTruncated = false;

  if (result.length > limit) {
    const sub = result.substring(0, limit);
    const lastSpaceIndex = sub.lastIndexOf(' ');
    result = lastSpaceIndex > 0 ? sub.substring(0, lastSpaceIndex) : sub;
    isTruncated = true;
  }

  result = result.replace(/[,/;\-:=&|]+$/, '').trim();

  return (
    <>
      {result}
      {isTruncated && (
        <Box
          component="span"
          sx={{
            ml: 0.35,
            fontFamily: 'var(--font-mono)',
            color: 'text.secondary',
          }}
        >
          …
        </Box>
      )}
    </>
  );
};

const detectEvidenceBadges = (article: Article): EvidenceBadge[] => {
  const haystack = `${stripHtmlTags(article.title)} ${stripHtmlTags(
    article.abstract
  )}`.toLowerCase();

  const badges: EvidenceBadge[] = [];

  const sampleSizeMatch = haystack.match(
    /\b(?:n\s*=\s*|sample size(?: of)?\s*)([\d,]{2,7})\b/i
  );

  if (sampleSizeMatch?.[1]) {
    badges.push({
      label: `N=${sampleSizeMatch[1].replace(/\s/g, '')}`,
      tone: 'teal',
    });
  }

  if (
    /\brandomi[sz]ed\b|\brct\b|\bdouble-blind\b|\bplacebo-controlled\b/.test(
      haystack
    )
  ) {
    badges.push({ label: 'Randomized trial', tone: 'teal' });
  } else if (/\bmeta-analysis\b|\bmeta analysis\b/.test(haystack)) {
    badges.push({ label: 'Meta-analysis', tone: 'purple' });
  } else if (/\bsystematic review\b/.test(haystack)) {
    badges.push({ label: 'Systematic review', tone: 'purple' });
  } else if (/\bcohort\b/.test(haystack)) {
    badges.push({ label: 'Cohort study', tone: 'teal' });
  }

  const phaseMatch = haystack.match(/\bphase\s+(i{1,3}|iv|[1-4])\b/i);

  if (phaseMatch?.[1]) {
    badges.push({
      label: `Phase ${phaseMatch[1].toUpperCase()}`,
      tone: 'purple',
    });
  }

  if (/\badverse event\b|\badverse events\b|\btoxicity\b|\bsafety\b/.test(haystack)) {
    badges.push({ label: 'Safety data', tone: 'red' });
  }

  if (isEpubAheadOfPrint(article.pubDate)) {
    badges.push({ label: 'Ahead of print' });
  }

  return badges.slice(0, 4);
};

const detectEntityTags = (article: Article): string[] => {
  const text = `${stripHtmlTags(article.title)} ${stripHtmlTags(
    article.abstract
  )}`;

  const patterns = [
    /\bPD-?1\b/gi,
    /\bPD-?L1\b/gi,
    /\bNSCLC\b/gi,
    /\bBRCA1\b/gi,
    /\bBRCA2\b/gi,
    /\bEGFR\b/gi,
    /\bALK\b/gi,
    /\bKRAS\b/gi,
    /\bHER2\b/gi,
    /\bPARP\b/gi,
    /\bPembrolizumab\b/gi,
    /\bNivolumab\b/gi,
    /\bAtezolizumab\b/gi,
    /\bOsimertinib\b/gi,
    /\bGlioblastoma\b/gi,
    /\bMelanoma\b/gi,
    /\bCarcinoma\b/gi,
    /\bLymphoma\b/gi,
    /\bImmunotherapy\b/gi,
    /\bCheckpoint inhibitor(?:s)?\b/gi,
  ];

  const found = new Map<string, string>();

  patterns.forEach((pattern) => {
    const matches = text.match(pattern);

    matches?.forEach((match) => {
      const normalized = match.replace(/\s+/g, ' ').trim();
      found.set(normalized.toLowerCase(), normalized);
    });
  });

  return Array.from(found.values()).slice(0, 6);
};

const ResultsList: React.FC<ResultsListProps> = ({ results }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, AnalysisState>>({});

  const preparedResults = useMemo(
    () =>
      results.map((article, index) => ({
        article,
        index,
        cleanTitle: stripHtmlTags(article.title),
        cleanAbstract: stripHtmlTags(article.abstract),
        badges: detectEvidenceBadges(article),
        entities: detectEntityTags(article),
      })),
    [results]
  );

  const handleCopyCitation = (article: Article) => {
    const firstAuthor =
      article.authors.length > 0 ? article.authors[0] : 'Unknown';
    const authorText =
      article.authors.length > 1 ? `${firstAuthor} et al.` : firstAuthor;
    const year = article.pubDate.replace(/\D/g, '').substring(0, 4) || 'n.d.';
    const cleanTitle = stripHtmlTags(article.title);
    const citation = `${authorText} ${cleanTitle}. ${article.journal}. ${year}; PMID: ${article.id}.`;

    navigator.clipboard.writeText(citation);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleAnalysis = async (article: Article) => {
    const existing = analyses[article.id];

    if (existing && !existing.loading && existing.data) {
      setAnalyses((prev) => ({
        ...prev,
        [article.id]: { ...existing, isOpen: !existing.isOpen },
      }));
      return;
    }

    setAnalyses((prev) => ({
      ...prev,
      [article.id]: {
        loading: true,
        data: '',
        error: null,
        isOpen: true,
      },
    }));

    try {
        const payloadArticles = [
        {
          id: article.id,
          title: article.title,
          abstract: article.abstract,
          journal: article.journal,
          url: article.url,
          authors: article.authors,
          pubDate: article.pubDate,
        },
      ];

      const response = await fetch(`${API_URL}/api/llm/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Critically appraise this paper for clinical relevance, study design, limitations, and usable findings: ${article.title}`,
          articles: payloadArticles,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || 'The appraisal could not be completed.'
        );
      }

      if (!response.body) {
        throw new Error('The browser could not open the appraisal stream.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

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
          accumulatedText += decoder.decode(value, { stream: true });

          setAnalyses((prev) => ({
            ...prev,
            [article.id]: {
              loading: false,
              data: accumulatedText,
              error: null,
              isOpen: true,
            },
          }));
        }
      }

      setAnalyses((prev) => ({
        ...prev,
        [article.id]: {
          loading: false,
          data: accumulatedText,
          error: null,
          isOpen: true,
        },
      }));
    } catch (err) {
      setAnalyses((prev) => ({
        ...prev,
        [article.id]: {
          loading: false,
          data: null,
          error:
            err instanceof Error
              ? err.message
              : 'The appraisal could not be completed.',
          isOpen: true,
        },
      }));
    }
  };

  const renderMarkdown = (text: string, isLoading: boolean) => {
    // Prevent markdown parser from dropping strings like "p<0.05"
    const safeText = text.replace(/<(?=[0-9a-zA-Z])/g, '< ');
    const displayText = isLoading && safeText.length > 0 ? `${safeText}\`█\`` : safeText;

    return (
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <Typography
              variant="body2"
              sx={{
                mb: 1,
                color: 'text.primary',
                fontSize: '0.76rem',
                lineHeight: 1.55,
              }}
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li
              style={{
                marginBottom: '6px',
                color: 'var(--biotech-black)',
                fontSize: '0.75rem',
              }}
            >
              <span style={{ lineHeight: 1.5 }}>{props.children}</span>
            </li>
          ),
          strong: ({ node, ...props }) => (
            <Box
              component="span"
              sx={{ fontWeight: 700, color: 'text.primary' }}
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (children && children[0] === '█') {
              return (
                <Box
                  component="span"
                  className="blinking-cursor"
                  sx={{ color: 'secondary.main' }}
                >
                  █
                </Box>
              );
            }

            return (
              <Box
                component="code"
                className={className}
                sx={{
                  px: 0.35,
                  py: 0.1,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'var(--biotech-data-wash)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                }}
                {...props}
              >
                {children}
              </Box>
            );
          },
        }}
      >
        {displayText}
      </ReactMarkdown>
    );
  };

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <Box sx={{ m: 0 }}>
      <Stack spacing={0}>
        {preparedResults.map(
          ({ article, index, cleanAbstract, badges, entities }) => {
            const analysis = analyses[article.id];
            const isAnalysisOpen = analysis?.isOpen;
            const isLoadingAnalysis = Boolean(analysis?.loading);

            return (
              <Paper
                key={article.id}
                elevation={0}
                square
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '108px minmax(0, 1fr)',
                  border: '1px solid',
                  borderColor: isAnalysisOpen ? 'primary.dark' : 'divider',
                  bgcolor: 'background.paper',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: 'translate3d(0,0,0)',
                  transition:
                    'border-color 140ms ease, transform 140ms ease, background-color 140ms ease',
                  '& + &': {
                    mt: '-1px',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: isAnalysisOpen ? 4 : 0,
                    bgcolor: isAnalysisOpen ? 'primary.dark' : 'primary.main',
                    transition: 'width 140ms ease, background-color 140ms ease',
                    zIndex: 2,
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    left: -72,
                    top: 0,
                    bottom: 0,
                    width: 72,
                    pointerEvents: 'none',
                    background:
                      'linear-gradient(90deg, transparent, rgba(35,139,125,0.1), transparent)',
                    animation: isLoadingAnalysis
                      ? 'paperSweep 1.7s linear infinite'
                      : 'none',
                    zIndex: 1,
                  },
                  '&:hover': {
                    borderColor: 'primary.dark',
                    transform: 'translateX(2px)',
                    zIndex: 1,
                    '&::before': {
                      width: 3,
                      bgcolor: 'primary.main',
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: 0,
                    p: 0.85,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'var(--biotech-data-wash)',
                    position: 'relative',
                    zIndex: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      color: 'primary.dark',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </Typography>

                  <Box sx={{ mt: 0.8 }}>
                    <Typography
                      sx={{
                        fontSize: '0.58rem',
                        fontWeight: 620,
                        color: 'text.secondary',
                      }}
                    >
                      PMID
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.15,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.62rem',
                        fontWeight: 600,
                        lineHeight: 1.25,
                        color: 'text.primary',
                        wordBreak: 'break-word',
                      }}
                    >
                      {article.id}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 0.75 }}>
                    <Typography
                      sx={{
                        fontSize: '0.58rem',
                        fontWeight: 620,
                        color: 'text.secondary',
                      }}
                    >
                      Published
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.15,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6rem',
                        lineHeight: 1.3,
                        color: 'text.primary',
                      }}
                    >
                      {article.pubDate || 'n.d.'}
                    </Typography>
                  </Box>

                  <Box
                    aria-hidden="true"
                    sx={{
                      mt: 0.85,
                      height: 4,
                      display: 'grid',
                      gridTemplateColumns: '1.4fr 0.8fr 1fr',
                      gap: 0.35,
                    }}
                  >
                    <Box sx={{ bgcolor: 'primary.main' }} />
                    <Box
                      sx={{
                        bgcolor: isAnalysisOpen ? 'secondary.main' : 'rgba(16,40,42,0.2)',
                      }}
                    />
                    <Box
                      sx={{
                        bgcolor: isLoadingAnalysis
                          ? 'secondary.main'
                          : 'rgba(16,40,42,0.16)',
                        animation: isLoadingAnalysis
                          ? 'evidenceRail 0.9s ease-in-out infinite alternate'
                          : 'none',
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ minWidth: 0, p: 0.95, position: 'relative', zIndex: 3 }}>
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 0.75 }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        noWrap
                        sx={{
                          maxWidth: '100%',
                          fontSize: '0.66rem',
                          fontWeight: 620,
                          lineHeight: 1.2,
                          color: 'text.secondary',
                        }}
                      >
                        {article.journal || 'Medical journal'}
                      </Typography>

                      <Stack
                        direction="row"
                        useFlexGap
                        flexWrap="wrap"
                        gap={0.45}
                        sx={{ mt: 0.55 }}
                      >
                        {badges.length > 0 ? (
                          badges.map((badge) => (
                            <Typography
                              key={badge.label}
                              className="clinical-data"
                              component="span"
                              data-tone={badge.tone}
                              sx={{
                                minHeight: '1.15rem',
                                fontSize: '0.62rem',
                              }}
                            >
                              {badge.label}
                            </Typography>
                          ))
                        ) : (
                          <Typography
                            className="clinical-data"
                            component="span"
                            sx={{
                              minHeight: '1.15rem',
                              fontSize: '0.62rem',
                            }}
                          >
                            Indexed article
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
                      <Tooltip
                        title={copiedId === article.id ? 'Copied' : 'Copy citation'}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleCopyCitation(article)}
                          sx={{
                            width: 26,
                            height: 26,
                            color:
                              copiedId === article.id
                                ? 'success.main'
                                : 'text.secondary',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 0,
                            transition:
                              'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
                            '&:hover': {
                              color: 'primary.dark',
                              bgcolor: 'var(--biotech-data-wash)',
                            },
                          }}
                        >
                          {copiedId === article.id ? (
                            <SuccessIcon sx={{ fontSize: 14 }} />
                          ) : (
                            <CopyIcon sx={{ fontSize: 14 }} />
                          )}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Open article">
                        <IconButton
                          size="small"
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            width: 26,
                            height: 26,
                            color: 'text.secondary',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 0,
                            transition:
                              'background-color 140ms ease, border-color 140ms ease, color 140ms ease',
                            '&:hover': {
                              color: 'primary.dark',
                              bgcolor: 'var(--biotech-data-wash)',
                            },
                          }}
                        >
                          <ExternalLinkIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                    sx={{ display: 'block' }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.94rem',
                        fontWeight: 700,
                        lineHeight: 1.27,
                        letterSpacing: '-0.012em',
                        color: 'text.primary',
                        transition: 'color 140ms ease',
                        '&:hover': {
                          color: 'primary.dark',
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: article.title }}
                    />
                  </Link>

                  <Stack
                    direction="row"
                    useFlexGap
                    flexWrap="wrap"
                    gap={0.45}
                    sx={{ mt: 0.8 }}
                  >
                    {entities.length > 0 ? (
                      entities.map((entity) => (
                        <Chip
                          key={entity}
                          label={entity}
                          size="small"
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Chip label="No indexed entity" size="small" variant="outlined" />
                    )}
                  </Stack>

                  <Typography
                    sx={{
                      mt: 0.9,
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {formatAbstract(cleanAbstract, 300)}
                  </Typography>

                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{
                      mt: 0.95,
                      pt: 0.8,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      noWrap
                      sx={{
                        minWidth: 0,
                        color: 'text.secondary',
                        fontSize: '0.68rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {article.authors && article.authors.length > 0
                        ? article.authors.slice(0, 4).join(', ') +
                          (article.authors.length > 4 ? ', et al.' : '')
                        : 'Authors not listed'}
                    </Typography>

                    <Button
                      size="small"
                      onClick={() => toggleAnalysis(article)}
                      startIcon={
                        <AppraisalIcon
                          sx={{
                            fontSize: '0.9rem !important',
                            color: analysis?.loading
                              ? 'text.secondary'
                              : isAnalysisOpen
                                ? 'secondary.main'
                                : 'inherit',
                            animation: analysis?.loading
                              ? 'pulse 1.4s steps(2, end) infinite'
                              : 'none',
                          }}
                        />
                      }
                      sx={{
                        flexShrink: 0,
                        minHeight: 26,
                        px: 0.8,
                        py: 0.35,
                        color: isAnalysisOpen
                          ? 'secondary.dark'
                          : 'text.secondary',
                        bgcolor: isAnalysisOpen
                          ? 'var(--biotech-violet-wash)'
                          : 'transparent',
                        borderColor: isAnalysisOpen
                          ? 'secondary.main'
                          : 'divider',
                        transition:
                          'background-color 140ms ease, border-color 140ms ease, color 140ms ease, transform 140ms ease',
                        '&:hover': {
                          color: 'secondary.dark',
                          bgcolor: 'var(--biotech-violet-wash)',
                          borderColor: 'secondary.main',
                          transform: 'translateX(1px)',
                        },
                      }}
                    >
                      {isAnalysisOpen ? 'Close appraisal' : 'Appraise'}
                    </Button>
                  </Stack>

                  <Collapse in={isAnalysisOpen} unmountOnExit>
                    <Box
                      sx={{
                        mt: 0.95,
                        border: '1px solid',
                        borderColor: analysis?.error
                          ? 'error.main'
                          : 'secondary.main',
                        bgcolor: 'var(--biotech-violet-wash)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: -60,
                          top: 0,
                          bottom: 0,
                          width: 60,
                          background:
                            'linear-gradient(90deg, transparent, rgba(76,92,158,0.18), transparent)',
                          animation: isLoadingAnalysis
                            ? 'appraisalSweep 1.8s linear infinite'
                            : 'none',
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                        sx={{
                          px: 0.85,
                          py: 0.65,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: 'secondary.dark',
                          }}
                        >
                          Paper appraisal
                        </Typography>

                        {analysis?.loading && (
                          <Typography
                            className="clinical-data"
                            component="span"
                            data-tone="purple"
                            sx={{
                              minHeight: '1.15rem',
                              fontSize: '0.62rem',
                            }}
                          >
                            Reviewing abstract
                          </Typography>
                        )}
                      </Stack>

                      <Box sx={{ p: 0.95, position: 'relative', zIndex: 1 }}>
                        {analysis?.error ? (
                          <Alert
                            severity="error"
                            sx={{
                              p: 0,
                              bgcolor: 'transparent',
                              border: 0,
                              '& .MuiAlert-icon': {
                                color: 'error.main',
                              },
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: '0.72rem',
                                color: 'error.main',
                              }}
                            >
                              {analysis.error}
                            </Typography>
                          </Alert>
                        ) : analysis?.loading && !analysis?.data ? (
                          <Stack spacing={0.55}>
                            {[
                              'Preparing source record',
                              'Reading available abstract',
                              'Writing appraisal',
                            ].map((line, lineIndex) => {
                              const isActive = lineIndex === 2;

                              return (
                                <Stack
                                  key={line}
                                  direction="row"
                                  spacing={0.65}
                                  alignItems="center"
                                >
                                  <Box
                                    sx={{
                                      width: isActive ? 18 : 7,
                                      height: 7,
                                      bgcolor: isActive
                                        ? 'secondary.main'
                                        : 'primary.main',
                                      opacity: isActive ? 1 : 0.55,
                                      animation: isActive
                                        ? 'appraisalStep 0.85s ease-in-out infinite alternate'
                                        : 'none',
                                    }}
                                  />
                                  <Typography
                                    sx={{
                                      fontSize: '0.7rem',
                                      color: isActive
                                        ? 'text.primary'
                                        : 'text.secondary',
                                    }}
                                  >
                                    {line}
                                  </Typography>
                                </Stack>
                              );
                            })}
                          </Stack>
                        ) : (
                          <Box
                            sx={{
                              color: 'text.primary',
                              '& ul': {
                                m: 0,
                                p: 0,
                                listStyle: 'none',
                              },
                              '& li': {
                                position: 'relative',
                                pl: 2,
                                mb: 0.8,
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: '0.55em',
                                  width: 5,
                                  height: 1,
                                  bgcolor: 'secondary.main',
                                },
                              },
                            }}
                          >
                            {renderMarkdown(
                              analysis?.data || '',
                              analysis?.loading || false
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Collapse>
                </Box>
              </Paper>
            );
          }
        )}
      </Stack>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }

        @keyframes paperSweep {
          0% {
            transform: translateX(0);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          80% {
            opacity: 1;
          }

          100% {
            transform: translateX(620px);
            opacity: 0;
          }
        }

        @keyframes appraisalSweep {
          0% {
            transform: translateX(0);
            opacity: 0;
          }

          20% {
            opacity: 1;
          }

          80% {
            opacity: 1;
          }

          100% {
            transform: translateX(480px);
            opacity: 0;
          }
        }

        @keyframes appraisalStep {
          0% {
            transform: translateX(0);
            opacity: 0.64;
          }

          100% {
            transform: translateX(3px);
            opacity: 1;
          }
        }

        @keyframes evidenceRail {
          0% {
            transform: scaleX(0.45);
            opacity: 0.45;
          }

          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }

        .blinking-cursor {
          animation: blink 1s step-end infinite;
          display: inline-block;
          vertical-align: bottom;
          margin-left: 2px;
        }
      `}</style>
    </Box>
  );
};

export default ResultsList;
