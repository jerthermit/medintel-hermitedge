// File: frontend/src/components/Header.tsx
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Tooltip from '@mui/material/Tooltip';
import CircleIcon from '@mui/icons-material/Circle';
import HubIcon from '@mui/icons-material/Hub';

// We stripped the search props because search now lives in the Workspace (App.tsx)
const Header: React.FC = () => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        color: '#0f172a'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: '64px', justifyContent: 'space-between' }}>

          {/* Left: Brand Identity */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
              src="/app-logo.png"
              alt="Hermit Edge Logo"
              width={32}
              height={32}
              fetchPriority="high"
              loading="eager"
              style={{ height: 32, width: 32, borderRadius: 6, objectFit: 'contain' }}
            />

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Hermit Edge
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>
                MEDICAL RESEARCH ASSISTANT
              </Typography>
            </Box>

            {/* Professional Engine Status Chip */}
            <Tooltip title="Llama-4-Maverick 402B Mixture-of-Experts Engine Online">
              <Chip
                label="LLAMA-4 MoE ACTIVE"
                size="small"
                icon={<HubIcon sx={{ fontSize: '14px !important', color: '#4f46e5 !important' }} />}
                sx={{
                  ml: 3,
                  height: 24,
                  bgcolor: '#eef2ff',
                  color: '#4338ca',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  letterSpacing: '0.04em',
                  border: '1px solid #c7d2fe',
                  display: { xs: 'none', md: 'flex' }
                }}
              />
            </Tooltip>
          </Box>

          {/* Right: System Telemetry */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Secure Connection to PubMed Database Active">
              <Chip
                label="PubMed® Live"
                variant="outlined"
                size="small"
                icon={<CircleIcon sx={{ fontSize: '8px !important', color: '#10b981 !important', animation: 'pulse 2s infinite' }} />}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#475569',
                  bgcolor: '#f8fafc',
                  fontWeight: 600,
                  height: 26,
                  '& .MuiChip-label': { px: 1.5 }
                }}
              />
            </Tooltip>
          </Box>

        </Toolbar>
      </Container>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </AppBar>
  );
};

export default Header;
