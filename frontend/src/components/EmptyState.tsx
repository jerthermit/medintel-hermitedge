// File: frontend/src/components/EmptyState.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  InputBase,
  IconButton,
  Chip,
  Stack,
  Fade
} from '@mui/material';
import {
  Search as SearchIcon,
  ArrowForward as ArrowIcon,
  Hub as EngineIcon,
  Biotech as BioIcon
} from '@mui/icons-material';

interface EmptyStateProps {
  onSearch: (query: string) => void;
}

const SUGGESTIONS = [
  "Treatment protocols for Type 2 Diabetes",
  "Latest mRNA vaccine side effects",
  "Immunotherapy in glioblastoma",
  "ACE inhibitors vs ARBs hypertension"
];

const EmptyState: React.FC<EmptyStateProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <Fade in timeout={800}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          maxWidth: '800px',
          mx: 'auto',
          px: 2
        }}
      >
        {/* Clinical Hero Icon */}
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            bgcolor: '#f8fafc',
            color: '#4f46e5',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <BioIcon sx={{ fontSize: 44 }} />
        </Box>

        {/* CORRECTED TITLE: Grounded & Professional */}
        <Typography variant="h4" sx={{ mb: 1.5, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Medical Research Assistant
        </Typography>

        <Typography variant="body1" sx={{ mb: 5, maxWidth: '550px', lineHeight: 1.6, color: '#475569', fontSize: '1.05rem' }}>
          A specialist reasoning engine for biomedical literature. <br/>
          Grounded in PubMed®. Synthesized by Llama-4-Maverick (402B MoE).
        </Typography>

        {/* Main Search Bar - The "Instrument" Feel */}
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            p: '6px 8px 6px 16px',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: '640px',
            borderRadius: 2.5,
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#94a3b8',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            },
            '&:focus-within': {
              borderColor: '#4f46e5',
              boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
            }
          }}
        >
          <SearchIcon sx={{ color: '#64748b', mr: 1.5 }} />
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: '1.05rem', color: '#0f172a' }}
            placeholder="Enter clinical query or PMID..."
            inputProps={{ 'aria-label': 'search medical research' }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <IconButton
            type="submit"
            disableRipple
            sx={{
              p: '10px',
              bgcolor: '#0f172a',
              color: 'white',
              borderRadius: 2,
              transition: 'background-color 0.2s',
              '&:hover': { bgcolor: '#334155' }
            }}
            aria-label="search"
          >
            <ArrowIcon fontSize="small" />
          </IconButton>
        </Paper>

        {/* Suggestions */}
        <Box sx={{ mt: 5 }}>
          <Stack direction="row" alignItems="center" justifyContent="center" gap={1} mb={2.5}>
            <EngineIcon fontSize="small" sx={{ color: '#64748b' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Suggested Queries
            </Typography>
          </Stack>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1.5 }}>
            {SUGGESTIONS.map((s) => (
              <Chip
                key={s}
                label={s}
                onClick={() => onSearch(s)}
                sx={{
                  bgcolor: '#f8fafc',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  py: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#4f46e5',
                    bgcolor: '#eef2ff',
                    color: '#4338ca'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default EmptyState;
