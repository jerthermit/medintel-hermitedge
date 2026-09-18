import React, { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  FactCheck as AppraisalIcon,
  ManageSearch as RationaleIcon,
  Psychology as InsightIcon,
  Science as ScienceIcon,
  StopCircle as StopIcon,
  WarningAmber as DisclaimerIcon,
  Analytics as DataIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Article } from '../hooks/useResearch';

interface SynthesisPanelProps {
  points: string | null;
  loading: boolean;
  error?: string;
  sourceArticles: Article[];
  onSynthesize: () => void;
  onStop?: () => void;
}

const reviewSteps = [
  'Holding retrieved papers',
  'Reading available abstracts',
  'Checking design and outcomes',
  'Separating evidence from interpretation',
  'Writing review',
];

const getSourceScopeLabel = (sourceCount: number, points: string | null) => {
  if (!points) return 'Not reviewed';
  if (sourceCount >= 8) return 'Broad source set';
  if (sourceCount >= 5) return 'Moderate source set';
  if (sourceCount >= 3) return 'Limited source set';
  return 'Narrow source set';
};

const SynthesisPanel: React.FC<SynthesisPanelProps> = ({
  points,
  loading,
  error,
  sourceArticles,
  onSynthesize,
  onStop,
}) => {
  const handleStop = () => {
    if (onStop) onStop();
  };

  const handleCopyReport = () => {
    if (points) navigator.clipboard.writeText(points);
  };

  const isProcessing = loading;
  const hasReview = Boolean(points && points.trim());

  const textToParse = useMemo(() => {
    let baseText = points || '';

    // Prevent markdown parser from treating unspaced math operators (like p<0.05) as HTML tags
    baseText = baseText.replace(/<(?=[0-9a-zA-Z])/g, '< ');

    if (isProcessing && baseText.length > 0) {
      baseText += '`█`';
    }

    return baseText;
  }, [isProcessing, points]);

  const parsedContent = useMemo(() => {
    if (!textToParse) return null;

    type SectionKey = 'rationale' | 'appraisal' | 'findings' | 'themes';

    const markers: Array<{
      key: SectionKey;
      pattern: RegExp;
    }> = [
      {
        key: 'rationale',
        pattern:
          /^[ 	]*(?:#{1,6}[ 	]*)?(?:\*\*)?[ 	]*SEARCH RATIONALE[ 	]*(?:\*\*)?[ 	]*:?[ 	]*$/im,
      },
      {
        key: 'appraisal',
        pattern:
          /^[ 	]*(?:#{1,6}[ 	]*)?(?:\*\*)?[ 	]*INDIVIDUAL EVIDENCE APP(?:RAISAL|ARISAL)[ 	]*(?:\*\*)?[ 	]*:?[ 	]*$/im,
      },
      {
        key: 'findings',
        pattern:
          /^[ 	]*(?:#{1,6}[ 	]*)?(?:\*\*)?[ 	]*KEY CLINICAL FINDINGS[ 	]*(?:\*\*)?[ 	]*:?[ 	]*$/im,
      },
      {
        key: 'themes',
        pattern:
          /^[ 	]*(?:#{1,6}[ 	]*)?(?:\*\*)?[ 	]*EMERGING THEMES[ 	]*(?:\*\*)?[ 	]*:?[ 	]*$/im,
      },
    ];

    const matches = markers
      .map(({ key, pattern }) => {
        const match = pattern.exec(textToParse);

        if (!match || match.index === undefined) return null;

        return {
          key,
          start: match.index,
          contentStart: match.index + match[0].length,
        };
      })
      .filter(
        (
          match
        ): match is {
          key: SectionKey;
          start: number;
          contentStart: number;
        } => match !== null
      )
      .sort((a, b) => a.start - b.start);

    if (matches.length === 0) {
      return { simple: textToParse };
    }

    const sections: Record<SectionKey, string> = {
      rationale: '',
      appraisal: '',
      findings: '',
      themes: '',
    };

    matches.forEach((match, index) => {
      const next = matches[index + 1];
      const end = next ? next.start : textToParse.length;

      sections[match.key] = textToParse
        .slice(match.contentStart, end)
        .trim();
    });

    return {
      simple: undefined,
      ...sections,
    };
  }, [textToParse]);

  const sourceScope = useMemo(
    () => getSourceScopeLabel(sourceArticles.length, points),
    [points, sourceArticles.length]
  );

  const renderWithCitations = (text: string) => {
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
                marginBottom: '7px',
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
              sx={{
                fontWeight: 700,
                color: 'text.primary',
              }}
              {...props}
            />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            if (children && children[0] === '█') {
              return (
                <Box
                  component="span"
                  className="blinking-cursor"
                  sx={{
                    color: 'secondary.main',
                  }}
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
                  color: 'secondary.dark',
                }}
                {...props}
              >
                {children}
              </Box>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  const reportListStyles = {
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
        top: '0.56em',
        width: 5,
        height: 1,
        bgcolor: 'currentColor',
      },
    },
    '& ol': {
      m: 0,
      pl: 2.2,
    },
  };

  if (!sourceArticles || sourceArticles.length === 0) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      square
      sx={{
        border: '1px solid',
        borderColor: hasReview || isProcessing ? 'secondary.main' : 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: hasReview || isProcessing ? 4 : 0,
          bgcolor: 'secondary.main',
          zIndex: 2,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          left: -80,
          top: 0,
          bottom: 0,
          width: 80,
          pointerEvents: 'none',
          background:
            'linear-gradient(90deg, transparent, rgba(76,92,158,0.12), transparent)',
          animation: isProcessing ? 'reviewSweep 2.2s linear infinite' : 'none',
          zIndex: 1,
        },
      }}
    >
      <Box
        sx={{
          px: 1,
          py: 0.85,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor:
            hasReview || isProcessing
              ? 'var(--biotech-violet-wash)'
              : 'background.paper',
          position: 'relative',
          zIndex: 3,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.65}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 7,
                  height: 7,
                  bgcolor: hasReview || isProcessing ? 'secondary.main' : 'divider',
                  boxShadow:
                    isProcessing
                      ? '0 0 0 3px rgba(76,92,158,0.14)'
                      : hasReview
                        ? '0 0 0 3px rgba(76,92,158,0.1)'
                        : 'none',
                  animation: isProcessing
                    ? 'reviewPulse 1.1s ease-in-out infinite alternate'
                    : 'none',
                }}
              />

              <Typography
                sx={{
                  fontSize: '0.9rem',
                  fontWeight: 720,
                  lineHeight: 1,
                  letterSpacing: '-0.012em',
                  color: 'secondary.dark',
                }}
              >
                Review
              </Typography>
            </Stack>

            <Typography
              noWrap
              sx={{
                mt: 0.38,
                fontSize: '0.66rem',
                fontWeight: 500,
                lineHeight: 1.2,
                color: 'text.secondary',
              }}
            >
              {sourceArticles.length} source
              {sourceArticles.length === 1 ? '' : 's'} selected
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            sx={{ flexShrink: 0 }}
          >
            {points && !isProcessing && (
              <Tooltip title="Copy review">
                <IconButton
                  onClick={handleCopyReport}
                  size="small"
                  sx={{
                    width: 28,
                    height: 28,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0,
                    color: 'text.secondary',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      color: 'secondary.dark',
                      bgcolor: 'var(--biotech-violet-wash)',
                      borderColor: 'secondary.main',
                    },
                  }}
                >
                  <CopyIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            )}

            {!isProcessing && !points && (
              <Button
                variant="contained"
                onClick={onSynthesize}
                startIcon={<ScienceIcon sx={{ fontSize: '0.95rem !important' }} />}
                sx={{
                  minHeight: 30,
                  px: 0.95,
                  py: 0.4,
                  bgcolor: 'secondary.main',
                  borderColor: 'secondary.main',
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                    borderColor: 'secondary.dark',
                  },
                }}
              >
                Run review
              </Button>
            )}

            {isProcessing && (
              <Button
                variant="outlined"
                onClick={handleStop}
                color="error"
                startIcon={<StopIcon sx={{ fontSize: '0.95rem !important' }} />}
                sx={{
                  minHeight: 30,
                  px: 0.95,
                  py: 0.4,
                  borderColor: 'error.main',
                  color: 'error.main',
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'var(--biotech-coral-wash)',
                    borderColor: 'error.main',
                  },
                }}
              >
                Stop
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ p: 1, position: 'relative', zIndex: 3 }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 1,
              p: 0.75,
              '& .MuiAlert-message': {
                fontSize: '0.72rem',
              },
            }}
          >
            {error}
          </Alert>
        )}

        {!points && !isProcessing && !error && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                position: 'absolute',
                right: 14,
                top: 13,
                width: 92,
                height: 54,
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: 0.35,
                opacity: 0.22,
              }}
            >
              {[
                0.35, 0.62, 0.44, 0.76, 0.52, 0.3,
                0.48, 0.28, 0.58, 0.4, 0.68, 0.36,
              ].map((height, index) => (
                <Box
                  key={index}
                  sx={{
                    alignSelf: 'end',
                    height: `${Math.round(height * 100)}%`,
                    bgcolor:
                      index % 4 === 0
                        ? 'secondary.main'
                        : index % 3 === 0
                          ? 'primary.main'
                          : 'text.secondary',
                  }}
                />
              ))}
            </Box>

            <Box
              sx={{
                px: 0.95,
                py: 0.75,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'var(--biotech-violet-wash)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'secondary.dark',
                }}
              >
                Ready
              </Typography>
            </Box>

            <Box sx={{ p: 0.95, position: 'relative', zIndex: 1 }}>
              <Typography
                sx={{
                  maxWidth: 310,
                  fontSize: '0.78rem',
                  lineHeight: 1.45,
                  color: 'text.secondary',
                }}
              >
                Run the review once the retrieved papers match the clinical
                question.
              </Typography>

              <Box
                sx={{
                  mt: 1,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    p: 0.75,
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'var(--biotech-data-wash)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: 620,
                      color: 'text.secondary',
                    }}
                  >
                    Sources
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.25,
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.84rem',
                      fontWeight: 620,
                      color: 'primary.dark',
                      lineHeight: 1,
                    }}
                  >
                    {sourceArticles.length}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 0.75,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: 620,
                      color: 'text.secondary',
                    }}
                  >
                    Status
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.25,
                      fontSize: '0.72rem',
                      fontWeight: 620,
                      color: 'secondary.dark',
                      lineHeight: 1.1,
                    }}
                  >
                    Not run
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {isProcessing && !points && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'secondary.main',
              bgcolor: 'var(--biotech-violet-wash)',
              overflow: 'hidden',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: -60,
                top: 0,
                bottom: 0,
                width: 60,
                background:
                  'linear-gradient(90deg, transparent, rgba(76,92,158,0.18), transparent)',
                animation: 'reviewLogSweep 1.8s linear infinite',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 0.95,
                py: 0.75,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'secondary.dark',
                }}
              >
                Review running
              </Typography>

              <Box
                sx={{
                  px: 0.6,
                  py: 0.15,
                  borderRadius: 1,
                  bgcolor: 'secondary.main',
                  color: 'white',
                  fontSize: '0.6rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >

              </Box>
            </Box>

            <Stack spacing={0.55} sx={{ p: 0.9, position: 'relative', zIndex: 1 }}>
              {reviewSteps.map((step, index) => {
                const isActive = index === 2;
                const isDone = index < 2;

                return (
                  <Stack
                    key={step}
                    direction="row"
                    alignItems="center"
                    spacing={0.75}
                  >
                    <Box
                      sx={{
                        width: isActive ? 20 : 7,
                        height: 7,
                        flexShrink: 0,
                        bgcolor: isActive
                          ? 'secondary.main'
                          : isDone
                            ? 'primary.main'
                            : 'text.secondary',
                        opacity: isActive || isDone ? 1 : 0.42,
                        transform: isActive ? 'translateX(2px)' : 'none',
                        animation: isActive
                          ? 'activeStep 0.9s ease-in-out infinite alternate'
                          : 'none',
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        lineHeight: 1.35,
                        color: isActive ? 'text.primary' : 'text.secondary',
                        fontWeight: isActive ? 620 : 500,
                      }}
                    >
                      {step}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        )}

        {parsedContent && (
          <Box>
            {parsedContent.simple !== undefined && (
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    px: 0.95,
                    py: 0.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'var(--biotech-violet-wash)',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: 'secondary.dark',
                    }}
                  >
                    Review
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 0.95,
                    minHeight: isProcessing ? 40 : 'auto',
                    ...reportListStyles,
                  }}
                >
                  {renderWithCitations(parsedContent.simple)}
                </Box>
              </Box>
            )}

            {parsedContent.simple === undefined && (
              <Stack spacing={1}>
                {parsedContent.rationale && (
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <SectionHeader
                      icon={<RationaleIcon sx={{ fontSize: 14 }} />}
                      label="Search basis"
                      tone="primary"
                    />
                    <Box sx={{ p: 0.95, ...reportListStyles }}>
                      <Typography
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.76rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {parsedContent.rationale.replace(/\*\*/g, '')}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {parsedContent.appraisal && (
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'primary.main',
                      bgcolor: 'var(--biotech-data-wash)',
                    }}
                  >
                    <SectionHeader
                      icon={<AppraisalIcon sx={{ fontSize: 14 }} />}
                      label="Evidence appraisal"
                      tone="primary"
                    />
                    <Box
                      sx={{
                        p: 0.95,
                        color: 'primary.dark',
                        ...reportListStyles,
                      }}
                    >
                      {renderWithCitations(parsedContent.appraisal)}
                    </Box>
                  </Box>
                )}

                {parsedContent.findings && (
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'secondary.main',
                      bgcolor: 'var(--biotech-violet-wash)',
                    }}
                  >
                    <SectionHeader
                      icon={<DataIcon sx={{ fontSize: 14 }} />}
                      label="Clinical findings"
                      tone="secondary"
                    />
                    <Box
                      sx={{
                        p: 0.95,
                        color: 'secondary.dark',
                        ...reportListStyles,
                      }}
                    >
                      {renderWithCitations(parsedContent.findings)}
                    </Box>
                  </Box>
                )}

                {parsedContent.themes && (
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <SectionHeader
                      icon={<InsightIcon sx={{ fontSize: 14 }} />}
                      label="Pattern notes"
                      tone="secondary"
                    />
                    <Box sx={{ p: 0.95, ...reportListStyles }}>
                      {renderWithCitations(parsedContent.themes)}
                    </Box>
                  </Box>
                )}
              </Stack>
            )}

            <Divider sx={{ my: 1, borderColor: 'divider' }} />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 132px',
                gap: 0,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 0.9 }}>
                <Stack direction="row" spacing={0.6} alignItems="center">
                  <DisclaimerIcon sx={{ color: 'text.secondary', fontSize: 15 }} />
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      color: 'text.secondary',
                    }}
                  >
                    Research use only
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    mt: 0.55,
                    color: 'text.secondary',
                    fontSize: '0.68rem',
                    lineHeight: 1.45,
                  }}
                >
                  Verify the review against the original articles before
                  clinical, academic, or operational use.
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 0.9,
                  borderLeft: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'var(--biotech-data-wash)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.62rem',
                    fontWeight: 620,
                    color: 'text.secondary',
                  }}
                >
                  Source scope
                </Typography>
                <Typography
                  sx={{
                    mt: 0.35,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    lineHeight: 1.15,
                    color:
                      sourceScope === 'Not reviewed'
                        ? 'text.secondary'
                        : 'primary.dark',
                  }}
                >
                  {sourceScope}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes reviewSweep {
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

        @keyframes reviewLogSweep {
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
            transform: translateX(460px);
            opacity: 0;
          }
        }

        @keyframes reviewPulse {
          0% {
            transform: scale(0.8);
            opacity: 0.52;
          }

          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes activeStep {
          0% {
            transform: translateX(0);
            opacity: 0.62;
          }

          100% {
            transform: translateX(3px);
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
    </Paper>
  );
};

interface SectionHeaderProps {
  icon: React.ReactNode;
  label: string;
  tone: 'primary' | 'secondary';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, label, tone }) => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.6}
      sx={{
        px: 0.9,
        py: 0.7,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor:
          tone === 'primary'
            ? 'var(--biotech-data-wash)'
            : 'var(--biotech-violet-wash)',
        color: tone === 'primary' ? 'primary.dark' : 'secondary.dark',
      }}
    >
      {icon}
      <Typography
        sx={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'inherit',
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};

export default SynthesisPanel;
