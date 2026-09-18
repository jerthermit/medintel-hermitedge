// File: frontend/src/components/Layout.tsx

import React from 'react';
import { Box, Link, Typography } from '@mui/material';

interface LayoutProps {
  children: React.ReactNode;
}

const workspaceStages = [
  {
    number: '01',
    label: 'Query',
    tone: 'primary.main',
  },
  {
    number: '02',
    label: 'Papers',
    tone: 'rgba(212,227,223,0.76)',
  },
  {
    number: '03',
    label: 'Review',
    tone: 'secondary.light',
  },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box
      className="molecular-stage"
      sx={{
        height: '100vh',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        color: 'var(--biotech-panel)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box
        component="header"
        sx={{
          flexShrink: 0,
          height: 64,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'minmax(300px, 23%) minmax(0, 1fr) minmax(220px, 20%)',
          },
          alignItems: 'stretch',
          position: 'relative',
          zIndex: 2,
          borderBottom: '1px solid rgba(212,227,223,0.22)',
          background:
            'linear-gradient(90deg, #0E3A38 0%, #15514D 48%, #174945 100%)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 1.05,
            px: 1.45,
            borderRight: { xs: 'none', md: '1px solid rgba(212,227,223,0.18)' },
          }}
        >
          <Link
            href="https://www.hermitedge.com"
            underline="none"
            sx={{
              width: 42,
              height: 42,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
            }}
          >
            <Box
              component="img"
              src="/app-logo.png"
              alt="MedIntel Logo"
              sx={{
                height: 36,
                width: 36,
                display: 'block',
                objectFit: 'contain',
                filter:
                  'saturate(1.08) contrast(1.1) drop-shadow(0 1px 1px rgba(0,0,0,0.24))',
              }}
            />
          </Link>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1.12rem',
                fontWeight: 760,
                lineHeight: 1,
                letterSpacing: '-0.028em',
                color: 'var(--biotech-panel)',
              }}
            >
              MedIntel
            </Typography>

            <Typography
              noWrap
              sx={{
                mt: 0.42,
                fontSize: '0.68rem',
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: 0,
                color: 'rgba(212,227,223,0.76)',
              }}
            >
              Evidence synthesis for medical research
            </Typography>
          </Box>
        </Box>

        <Box
          aria-hidden="true"
          sx={{
            minWidth: 0,
            display: { xs: 'none', md: 'grid' },
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            alignItems: 'stretch',
            borderRight: '1px solid rgba(212,227,223,0.18)',
            background: 'rgba(212,227,223,0.035)',
          }}
        >
          {workspaceStages.map((item) => (
            <Box
              key={item.label}
              sx={{
                minWidth: 0,
                px: 1.15,
                display: 'flex',
                alignItems: 'center',
                gap: 0.7,
                borderRight: '1px solid rgba(212,227,223,0.14)',
                position: 'relative',
                '&:last-of-type': {
                  borderRight: 0,
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 2,
                  bgcolor: item.tone,
                  opacity: item.label === 'Papers' ? 0.36 : 0.82,
                },
              }}
            >
              <Typography
                noWrap
                sx={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.58rem',
                  fontWeight: 600,
                  lineHeight: 1,
                  color: 'rgba(212,227,223,0.48)',
                }}
              >
                {item.number}
              </Typography>

              <Typography
                noWrap
                sx={{
                  fontSize: '0.72rem',
                  fontWeight: 560,
                  lineHeight: 1,
                  letterSpacing: 0,
                  color: 'rgba(212,227,223,0.82)',
                }}
              >
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            minWidth: 0,
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: 1.35,
            gap: 0.75,
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 7,
              height: 7,
              bgcolor: 'primary.main',
              boxShadow: '0 0 0 3px rgba(35,139,125,0.18)',
            }}
          />

          <Box sx={{ minWidth: 0, textAlign: 'right' }}>
            <Typography
              noWrap
              sx={{
                fontSize: '0.68rem',
                fontWeight: 620,
                lineHeight: 1,
                letterSpacing: 0,
                color: 'rgba(212,227,223,0.82)',
              }}
            >
              NCBI / PubMed
            </Typography>

            <Typography
              noWrap
              sx={{
                mt: 0.35,
                fontSize: '0.58rem',
                fontWeight: 500,
                lineHeight: 1,
                letterSpacing: 0,
                color: 'rgba(212,227,223,0.5)',
              }}
            >
              source index
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
          p: { xs: 0, md: 1 },
        }}
      >
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            flex: 1,
            minHeight: 0,
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Box
            className="molecular-panel"
            sx={{
              width: '100%',
              maxWidth: 420,
              p: 2,
              position: 'relative',
              overflow: 'hidden',
              borderColor: 'rgba(21,36,38,0.18)',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                bgcolor: 'primary.main',
              },
            }}
          >
            <Typography
              sx={{
                fontSize: '0.86rem',
                fontWeight: 700,
                letterSpacing: '-0.012em',
                color: 'text.primary',
              }}
            >
              Wider screen needed
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: '0.82rem',
                lineHeight: 1.4,
                color: 'text.secondary',
              }}
            >
              MedIntel uses three panes for query, papers, and synthesis. Open it
              on desktop or tablet.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            border: '1px solid var(--biotech-line)',
            background: 'rgba(23,58,58,0.68)',
          }}
        >
          {children}
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          flexShrink: 0,
          height: 28,
          px: 1.35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: '1px solid var(--biotech-line)',
          background: 'rgba(16,44,46,0.96)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.64rem',
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: 0,
            color: 'rgba(212,227,223,0.58)',
          }}
        >
          © 2026 Emman Ermitaño. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;
