// File: frontend/src/components/Footer.tsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const Footer: React.FC = () => (
  <Box
    component="footer"
    sx={{
      mt: 'auto',
      py: 3,
      px: 2,
      textAlign: 'center',
      backgroundColor: 'background.paper',
      borderTop: '1px solid #e0e0e0',
    }}
  >
    <Typography variant="body2" color="textSecondary">
      © Emman Ermitaño. All rights reserved.
    </Typography>
  </Box>
);

export default Footer;
