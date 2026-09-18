import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  InputBase,
  Button,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward as ArrowIcon,
  Science as ScienceIcon,
  AutoStories as JournalIcon,
  Psychology as BrainIcon,
} from '@mui/icons-material';

import Layout from './components/Layout';
import ResultsList from './components/ResultsList';
import SynthesisPanel from './components/SynthesisPanel';
import { useResearch } from './hooks/useResearch';

const researchFilters = [
  {
    label: 'Clinical trial',
    term: 'Clinical Trial',
    icon: ScienceIcon,
    tone: 'primary' as const,
  },
  {
    label: 'Review',
    term: 'Systematic Review',
    icon: BrainIcon,
    tone: 'neutral' as const,
  },
  {
    label: 'Meta-analysis',
    term: 'Meta-Analysis',
    icon: JournalIcon,
    tone: 'secondary' as const,
  },
];

const starterQueries = [
  '"PD-1 inhibitors" AND "NSCLC"',
  '"BRCA1" AND "PARP inhibitor"',
  '"Pembrolizumab" AND "adverse events"',
  '"EGFR exon 19 deletion" AND "osimertinib"',
];

function App() {
  const [query, setQuery] = useState('');
  const [currentSearchStep, setCurrentSearchStep] = useState(0);

  const {
    search,
    results,
    loading,
    error,
    synthesis,
    synthesize,
    isSynthesizing,
    stopSynthesis,
  } = useResearch();

  const searchSteps = useMemo(
    () => [
      'Retrieving records',
      'Reading metadata',
      'Checking abstracts',
      'Sorting relevance',
      'Preparing sources',
    ],
    []
  );

  useEffect(() => {
    if (loading) {
      setCurrentSearchStep(0);

      const interval = setInterval(() => {
        setCurrentSearchStep((prev) =>
          Math.min(prev + 1, searchSteps.length - 1)
        );
      }, 700);

      return () => clearInterval(interval);
    }
  }, [loading, searchSteps.length]);

  const handleSearch = () => {
    if (query.trim()) {
      search(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSynthesize = () => {
    if (query && results.length > 0) {
      synthesize(query, results);
    }
  };

  const handleFilterClick = (term: string) => {
    setQuery((prev) => (prev ? `${prev} AND "${term}"` : `"${term}"`));
  };

  const hasResults = results && results.length > 0;
  const hasWorkspaceActivity = hasResults || loading || Boolean(error);
  const trimmedQuery = query.trim();

  return (
    <Layout>
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns:
            'minmax(320px, 24%) minmax(455px, 40%) minmax(390px, 36%)',
          overflow: 'hidden',
          bgcolor: 'transparent',
        }}
      >
        <Box
          component="aside"
          className="molecular-panel-dark"
          sx={{
            minHeight: 0,
            overflowY: 'auto',
            borderRight: '1px solid var(--biotech-line)',
            display: 'flex',
            flexDirection: 'column',
            background:
              'linear-gradient(180deg, rgba(20,76,72,0.96), rgba(16,44,46,0.96))',
          }}
        >
          <Box
            sx={{
              px: 1.25,
              py: 1.15,
              borderBottom: '1px solid var(--biotech-line)',
              bgcolor: 'rgba(212,227,223,0.05)',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 640,
                lineHeight: 1,
                letterSpacing: '-0.004em',
                color: 'rgba(212,227,223,0.68)',
              }}
            >
              Query
            </Typography>
          </Box>

          <Box sx={{ p: 1.25 }}>
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                width: '100%',
                border: '1px solid',
                borderColor: trimmedQuery
                  ? 'primary.light'
                  : 'rgba(212,227,223,0.28)',
                bgcolor: 'var(--biotech-panel)',
                position: 'relative',
                overflow: 'hidden',
                transform: trimmedQuery ? 'translateY(-1px)' : 'none',
                boxShadow: trimmedQuery
                  ? '0 0 0 1px rgba(35,139,125,0.12)'
                  : 'none',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: -1,
                  top: -1,
                  bottom: -1,
                  width: trimmedQuery ? 5 : 2,
                  bgcolor: trimmedQuery
                    ? 'primary.main'
                    : 'rgba(212,227,223,0.3)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: loading
                    ? 'linear-gradient(90deg, transparent, rgba(35,139,125,0.18), transparent)'
                    : trimmedQuery
                      ? 'linear-gradient(90deg, transparent, rgba(35,139,125,0.08), transparent)'
                      : 'transparent',
                  animation: loading
                    ? 'querySweep 1.15s linear infinite'
                    : trimmedQuery
                      ? 'queryGlow 3.8s ease-in-out infinite'
                      : 'none',
                },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: '1px solid rgba(16,40,42,0.16)',
                  color: trimmedQuery ? 'primary.dark' : 'text.secondary',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <SearchIcon sx={{ fontSize: 16 }} />
              </Box>

              <InputBase
                sx={{
                  flex: 1,
                  minHeight: 48,
                  px: 1,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  letterSpacing: '-0.006em',
                  color: 'text.primary',
                  position: 'relative',
                  zIndex: 1,
                  '& input::placeholder': {
                    opacity: 0.78,
                    color: 'text.secondary',
                    fontWeight: 450,
                  },
                }}
                placeholder="PD-1 inhibitors in NSCLC"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />

              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading || !trimmedQuery}
                sx={{
                  minWidth: 48,
                  px: 1,
                  borderTop: 0,
                  borderBottom: 0,
                  borderRight: 0,
                  borderColor: 'primary.main',
                  position: 'relative',
                  zIndex: 1,
                }}
                aria-label="Run query"
              >
                {loading ? (
                  <SearchIcon
                    sx={{
                      fontSize: 16,
                      animation: 'buttonPulse 0.9s ease-in-out infinite alternate',
                    }}
                  />
                ) : (
                  <ArrowIcon sx={{ fontSize: 17 }} />
                )}
              </Button>
            </Paper>

            <Box sx={{ mt: 1.25 }}>
              <Typography
                sx={{
                  mb: 0.65,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: 0,
                  color: 'rgba(212,227,223,0.66)',
                }}
              >
                Study type
              </Typography>

              <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.55}>
                {researchFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isSecondary = filter.tone === 'secondary';
                  const isPrimary = filter.tone === 'primary';

                  return (
                    <Box
                      key={filter.term}
                      component="button"
                      type="button"
                      onClick={() => handleFilterClick(filter.term)}
                      sx={{
                        minHeight: 34,
                        px: 0.75,
                        py: 0.45,
                        m: 0,
                        border: '1px solid',
                        borderColor: isPrimary
                          ? 'rgba(63,169,154,0.55)'
                          : isSecondary
                            ? 'rgba(102,118,183,0.52)'
                            : 'rgba(212,227,223,0.28)',
                        bgcolor: isPrimary
                          ? 'rgba(35,139,125,0.16)'
                          : isSecondary
                            ? 'rgba(76,92,158,0.14)'
                            : 'rgba(212,227,223,0.08)',
                        color: 'rgba(212,227,223,0.8)',
                        textAlign: 'left',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.55,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        transform: 'translate3d(0,0,0)',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                          borderColor: isSecondary
                            ? 'secondary.light'
                            : 'primary.light',
                          bgcolor: isSecondary
                            ? 'rgba(76,92,158,0.22)'
                            : 'rgba(35,139,125,0.22)',
                        },
                        '&:focus-visible': {
                          outline: '2px solid var(--biotech-teal)',
                          outlineOffset: 2,
                        },
                      }}
                    >
                      <Icon sx={{ fontSize: 14 }} />
                      <Typography
                        noWrap
                        sx={{
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          lineHeight: 1,
                          letterSpacing: 0,
                          color: 'inherit',
                        }}
                      >
                        {filter.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            <Box sx={{ mt: 1.25 }}>
              <Typography
                sx={{
                  mb: 0.65,
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  letterSpacing: 0,
                  color: 'rgba(212,227,223,0.66)',
                }}
              >
                Examples
              </Typography>

              <Stack spacing={0.55}>
                {starterQueries.map((sample) => (
                  <Box
                    key={sample}
                    component="button"
                    type="button"
                    onClick={() => setQuery(sample)}
                    sx={{
                      width: '100%',
                      px: 0.78,
                      py: 0.66,
                      border: '1px solid rgba(212,227,223,0.18)',
                      bgcolor:
                        sample === trimmedQuery
                          ? 'rgba(35,139,125,0.14)'
                          : 'rgba(212,227,223,0.06)',
                      color:
                        sample === trimmedQuery
                          ? 'var(--biotech-panel)'
                          : 'rgba(212,227,223,0.68)',
                      textAlign: 'left',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.64rem',
                      fontWeight: 500,
                      lineHeight: 1.25,
                      letterSpacing: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        bgcolor:
                          sample === trimmedQuery ? 'primary.main' : 'transparent',
                      },
                      '&:hover': {
                        color: 'var(--biotech-panel)',
                        borderColor: 'rgba(63,169,154,0.5)',
                        bgcolor: 'rgba(35,139,125,0.12)',
                        '&::before': {
                          bgcolor: 'primary.main',
                        },
                      },
                      '&:focus-visible': {
                        outline: '2px solid var(--biotech-teal)',
                        outlineOffset: 2,
                      },
                    }}
                  >
                    {sample}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Box
            sx={{
              px: 1,
              py: 0.85,
              borderTop: '1px solid var(--biotech-line)',
              bgcolor: 'rgba(212,227,223,0.05)',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.66rem',
                fontWeight: 500,
                color: 'rgba(212,227,223,0.58)',
              }}
            >
              Sources loaded
            </Typography>
            <Typography
              sx={{
                mt: 0.35,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.86rem',
                fontWeight: 600,
                lineHeight: 1,
                color: hasResults
                  ? 'var(--biotech-panel)'
                  : 'rgba(212,227,223,0.48)',
              }}
            >
              {results.length}
            </Typography>
          </Box>
        </Box>

        <Box
          component="section"
          className="molecular-panel"
          sx={{
            minHeight: 0,
            overflowY: 'auto',
            borderRight: '1px solid var(--biotech-line)',
            bgcolor:
              'linear-gradient(180deg, var(--biotech-panel-soft), var(--biotech-panel))',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              px: 1.2,
              py: 0.85,
              borderBottom: '1px solid rgba(16,40,42,0.16)',
              bgcolor: 'rgba(212,227,223,0.98)',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Typography
                sx={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.018em',
                  color: 'primary.dark',
                }}
              >
                Papers
              </Typography>

              {hasResults && (
                <Typography
                  sx={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.66rem',
                    fontWeight: 560,
                    color: 'primary.dark',
                  }}
                >
                  {results.length}
                </Typography>
              )}
            </Stack>
          </Box>

          <Box sx={{ p: 1 }}>
            {error && !loading && (
              <Paper
                elevation={0}
                sx={{
                  mb: 1,
                  p: 1,
                  border: '1px solid',
                  borderColor: 'error.main',
                  bgcolor: 'var(--biotech-coral-wash)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.74rem',
                    lineHeight: 1.4,
                    color: 'error.main',
                  }}
                >
                  {error}
                </Typography>
              </Paper>
            )}

            {loading && (
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  border: '1px solid rgba(35,139,125,0.34)',
                  bgcolor: 'var(--biotech-panel)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -48,
                    top: 0,
                    bottom: 0,
                    width: 48,
                    background:
                      'linear-gradient(90deg, transparent, rgba(35,139,125,0.18), transparent)',
                    animation: 'sourceCardSweep 1.9s linear infinite',
                  },
                }}
              >
                <Typography
                  sx={{
                    mb: 0.85,
                    fontSize: '0.84rem',
                    fontWeight: 650,
                    lineHeight: 1,
                    letterSpacing: '-0.012em',
                    color: 'text.primary',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Loading source records
                </Typography>

                <Stack spacing={0.55} sx={{ position: 'relative', zIndex: 1 }}>
                  {searchSteps.map((step, index) => {
                    if (index > currentSearchStep) return null;

                    const isActive = index === currentSearchStep;

                    return (
                      <Stack
                        key={step}
                        direction="row"
                        spacing={0.75}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: isActive ? 20 : 7,
                            height: 7,
                            flexShrink: 0,
                            bgcolor: isActive ? 'secondary.main' : 'primary.main',
                            opacity: isActive ? 1 : 0.62,
                            transform: isActive ? 'translateX(2px)' : 'none',
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: '0.72rem',
                            lineHeight: 1.3,
                            color: isActive ? 'text.primary' : 'text.secondary',
                            fontWeight: isActive ? 600 : 450,
                          }}
                        >
                          {step}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </Paper>
            )}

            {!loading && !hasWorkspaceActivity && (
              <Paper
                elevation={0}
                sx={{
                  minHeight: 280,
                  p: 1.25,
                  border: '1px solid rgba(16,40,42,0.14)',
                  bgcolor: 'var(--biotech-panel)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    bgcolor: 'rgba(35,139,125,0.34)',
                  },
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    position: 'absolute',
                    right: 14,
                    top: 14,
                    width: 118,
                    display: 'grid',
                    gap: 0.45,
                    opacity: 0.28,
                  }}
                >
                  {[0, 1, 2].map((row) => (
                    <Box
                      key={row}
                      sx={{
                        height: 18,
                        border: '1px solid rgba(16,40,42,0.16)',
                        bgcolor:
                          row === 0
                            ? 'rgba(35,139,125,0.14)'
                            : row === 1
                              ? 'rgba(76,92,158,0.12)'
                              : 'rgba(16,40,42,0.08)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          left: 6,
                          top: 7,
                          width: row === 0 ? 48 : row === 1 ? 68 : 38,
                          height: 2,
                          bgcolor:
                            row === 1
                              ? 'secondary.main'
                              : 'primary.main',
                          opacity: 0.78,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: 6,
                          bottom: 4,
                          width: row === 0 ? 78 : row === 1 ? 52 : 72,
                          height: 1,
                          bgcolor: 'text.secondary',
                          opacity: 0.48,
                        },
                      }}
                    />
                  ))}
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: 330,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '1.38rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: '-0.034em',
                      color: 'text.primary',
                    }}
                  >
                    Source records will appear here.
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.85,
                      fontSize: '0.76rem',
                      lineHeight: 1.38,
                      color: 'text.secondary',
                    }}
                  >
                    Titles, abstracts, authors, journals, and citations remain
                    visible beside the generated synthesis.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    borderTop: '1px solid rgba(16,40,42,0.12)',
                    pt: 0.8,
                    mt: 2,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {['titles', 'abstracts', 'citations'].map((item) => (
                    <Typography
                      key={item}
                      sx={{
                        fontSize: '0.64rem',
                        fontWeight: 600,
                        color: 'text.secondary',
                      }}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            )}

            {!loading && hasResults && <ResultsList results={results} />}
          </Box>
        </Box>

        <Box
          component="section"
          className="molecular-panel"
          sx={{
            minHeight: 0,
            overflowY: 'auto',
            bgcolor:
              'linear-gradient(180deg, var(--biotech-panel), var(--biotech-panel-soft))',
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              px: 1.2,
              py: 0.85,
              borderBottom: '1px solid rgba(16,40,42,0.16)',
              bgcolor: 'rgba(212,227,223,0.98)',
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              spacing={1}
            >
              <Typography
                sx={{
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.018em',
                  color: 'secondary.dark',
                }}
              >
                Synthesis
              </Typography>

              {isSynthesizing && (
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: 'secondary.dark',
                  }}
                >
                  generating
                </Typography>
              )}
            </Stack>
          </Box>

          <Box sx={{ p: 1 }}>
            <SynthesisPanel
              points={synthesis}
              loading={isSynthesizing}
              error={error || undefined}
              sourceArticles={results}
              onSynthesize={handleSynthesize}
              onStop={stopSynthesis}
            />
          </Box>
        </Box>

        <style>{`
          @keyframes querySweep {
            0% {
              transform: translateX(-100%);
            }

            100% {
              transform: translateX(100%);
            }
          }

          @keyframes queryGlow {
            0%, 100% {
              opacity: 0.18;
              transform: translateX(-28%);
            }

            50% {
              opacity: 0.5;
              transform: translateX(28%);
            }
          }

          @keyframes sourceCardSweep {
            0% {
              transform: translateX(0);
              opacity: 0;
            }

            18% {
              opacity: 1;
            }

            78% {
              opacity: 1;
            }

            100% {
              transform: translateX(560px);
              opacity: 0;
            }
          }

          @keyframes buttonPulse {
            0% {
              transform: scale(0.94);
              opacity: 0.58;
            }

            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </Box>
    </Layout>
  );
}

export default App;
