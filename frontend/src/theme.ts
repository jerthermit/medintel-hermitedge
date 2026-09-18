// File: frontend/src/theme.ts

import { createTheme } from '@mui/material/styles';

const biotech = {
  shell: '#173A3A',
  shellDeep: '#102C2E',
  shellSoft: '#21484A',

  surface: '#BFD3CF',
  surfaceStrong: '#D4E3DF',
  surfaceMuted: '#A9C2BD',
  surfacePressed: '#91ADA7',

  reading: '#CFE0DC',
  readingSoft: '#B9D0CB',

  ink: '#10282A',
  inkSoft: '#435E61',
  inkMuted: '#647D80',

  line: 'rgba(16, 40, 42, 0.26)',
  lineSoft: 'rgba(16, 40, 42, 0.16)',
  lineOnDark: 'rgba(212, 227, 223, 0.24)',
  lineOnDarkStrong: 'rgba(212, 227, 223, 0.38)',

  teal: '#238B7D',
  tealDeep: '#176C63',
  tealLight: '#3FA99A',

  indigo: '#4C5C9E',
  indigoDeep: '#36447D',
  indigoLight: '#6676B7',

  red: '#A83A4A',
  amber: '#9B6A2F',
  green: '#347E5D',

  dataWash: '#AFCBC5',
  indigoWash: '#C4CAE3',
  redWash: '#E3C3C9',
  amberWash: '#DED0B8',
  greenWash: '#B9D5C3',
};

const fontSans =
  '"Manrope", "IBM Plex Sans", "Source Sans 3", "Aptos", "Public Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif';
const fontMono =
  '"IBM Plex Mono", "Roboto Mono", "SFMono-Regular", "Consolas", "Liberation Mono", monospace';

const noCssTransition = 'none';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: biotech.teal,
      light: biotech.tealLight,
      dark: biotech.tealDeep,
      contrastText: biotech.surfaceStrong,
    },
    secondary: {
      main: biotech.indigo,
      light: biotech.indigoLight,
      dark: biotech.indigoDeep,
      contrastText: biotech.surfaceStrong,
    },
    background: {
      default: biotech.shell,
      paper: biotech.surfaceStrong,
    },
    text: {
      primary: biotech.ink,
      secondary: biotech.inkSoft,
    },
    error: {
      main: biotech.red,
    },
    warning: {
      main: biotech.amber,
    },
    success: {
      main: biotech.green,
    },
    divider: biotech.line,
  },
  typography: {
    fontFamily: fontSans,
    htmlFontSize: 16,
    allVariants: {
      letterSpacing: '-0.008em',
      color: biotech.ink,
    },
    h1: {
      fontWeight: 760,
      fontSize: '5.0625rem',
      lineHeight: 0.94,
      letterSpacing: '-0.05em',
    },
    h2: {
      fontWeight: 750,
      fontSize: '3.375rem',
      lineHeight: 0.98,
      letterSpacing: '-0.04em',
    },
    h3: {
      fontWeight: 740,
      fontSize: '2.25rem',
      lineHeight: 1,
      letterSpacing: '-0.032em',
    },
    h4: {
      fontWeight: 730,
      fontSize: '1.5rem',
      lineHeight: 1.08,
      letterSpacing: '-0.024em',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1rem',
      lineHeight: 1.18,
      letterSpacing: '-0.016em',
    },
    h6: {
      fontFamily: fontSans,
      fontWeight: 700,
      fontSize: '0.8125rem',
      lineHeight: 1.2,
      letterSpacing: '-0.012em',
      color: biotech.ink,
    },
    body1: {
      fontWeight: 470,
      fontSize: '1rem',
      lineHeight: 1.45,
      letterSpacing: '-0.008em',
    },
    body2: {
      fontWeight: 470,
      fontSize: '0.8125rem',
      lineHeight: 1.42,
      letterSpacing: '-0.006em',
    },
    caption: {
      fontFamily: fontSans,
      fontWeight: 520,
      fontSize: '0.6875rem',
      lineHeight: 1.32,
      letterSpacing: '-0.002em',
      color: biotech.inkSoft,
    },
    overline: {
      fontFamily: fontSans,
      fontWeight: 680,
      fontSize: '0.625rem',
      lineHeight: 1.2,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      color: biotech.inkSoft,
    },
    button: {
      fontFamily: fontSans,
      fontWeight: 700,
      fontSize: '0.6875rem',
      lineHeight: 1,
      letterSpacing: '-0.002em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--biotech-black': biotech.shellDeep,
          '--biotech-white': biotech.surfaceStrong,
          '--biotech-porcelain': biotech.shell,
          '--biotech-bone': biotech.surfaceMuted,
          '--biotech-silver': biotech.lineOnDark,
          '--biotech-graphite': biotech.ink,
          '--biotech-muted': biotech.inkSoft,
          '--biotech-teal': biotech.teal,
          '--biotech-teal-deep': biotech.tealDeep,
          '--biotech-purple': biotech.indigo,
          '--biotech-purple-deep': biotech.indigoDeep,
          '--biotech-red': biotech.red,
          '--biotech-amber': biotech.amber,
          '--biotech-green': biotech.green,
          '--biotech-data-wash': biotech.dataWash,
          '--biotech-void': biotech.shell,
          '--biotech-deep': biotech.shellDeep,
          '--biotech-basin': biotech.shellSoft,
          '--biotech-panel': biotech.surfaceStrong,
          '--biotech-panel-soft': biotech.surface,
          '--biotech-glass': 'rgba(212, 227, 223, 0.9)',
          '--biotech-glass-strong': 'rgba(212, 227, 223, 0.96)',
          '--biotech-line': biotech.lineOnDark,
          '--biotech-line-strong': biotech.lineOnDarkStrong,
          '--biotech-violet-wash': biotech.indigoWash,
          '--biotech-coral-wash': biotech.redWash,
          '--font-sans': fontSans,
          '--font-mono': fontMono,
        },
        '.molecular-stage': {
          background:
            `linear-gradient(135deg, ${biotech.shellDeep}, ${biotech.shell} 46%, ${biotech.shellSoft})`,
        },
        '.molecular-panel': {
          border: `1px solid ${biotech.lineOnDarkStrong}`,
          background:
            `linear-gradient(180deg, rgba(212, 227, 223, 0.98), rgba(184, 208, 203, 0.96))`,
          backdropFilter: 'blur(10px)',
        },
        '.molecular-panel-dark': {
          border: `1px solid ${biotech.lineOnDark}`,
          background:
            `linear-gradient(180deg, rgba(16, 44, 46, 0.94), rgba(23, 58, 58, 0.92))`,
          color: biotech.surfaceStrong,
          backdropFilter: 'blur(10px)',
        },
        '.clinical-data': {
          display: 'inline-flex',
          alignItems: 'center',
          minHeight: '1.25rem',
          padding: '0 0.38rem',
          border: `1px solid rgba(35, 139, 125, 0.42)`,
          backgroundColor: biotech.dataWash,
          color: biotech.tealDeep,
          fontFamily: fontMono,
          fontSize: '0.6875rem',
          fontWeight: 620,
          lineHeight: 1.2,
          letterSpacing: '0.005em',
          whiteSpace: 'nowrap',
        },
        '.clinical-data[data-tone="teal"]': {
          borderColor: 'rgba(35, 139, 125, 0.52)',
          backgroundColor: biotech.dataWash,
          color: biotech.tealDeep,
        },
        '.clinical-data[data-tone="purple"]': {
          borderColor: 'rgba(76, 92, 158, 0.46)',
          backgroundColor: biotech.indigoWash,
          color: biotech.indigoDeep,
        },
        '.clinical-data[data-tone="red"]': {
          borderColor: 'rgba(168, 58, 74, 0.46)',
          backgroundColor: biotech.redWash,
          color: biotech.red,
        },
        '.surgical-glide': {
          transition: noCssTransition,
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          transition: noCssTransition,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 34,
          padding: '0.48rem 0.78rem',
          borderRadius: 0,
          border: '1px solid currentColor',
          boxShadow: 'none',
          transition: noCssTransition,
          '&:hover': {
            boxShadow: 'none',
          },
          '&:focus-visible': {
            outline: `2px solid ${biotech.teal}`,
            outlineOffset: 2,
          },
          '&.Mui-disabled': {
            borderColor: 'rgba(212, 227, 223, 0.24)',
            backgroundColor: 'rgba(212, 227, 223, 0.1)',
            color: 'rgba(212, 227, 223, 0.48)',
            opacity: 1,
          },
        },
        contained: {
          borderColor: 'transparent',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: biotech.teal,
          color: biotech.surfaceStrong,
          '&:hover': {
            backgroundColor: biotech.tealDeep,
          },
        },
        containedSecondary: {
          backgroundColor: biotech.indigo,
          color: biotech.surfaceStrong,
          '&:hover': {
            backgroundColor: biotech.indigoDeep,
          },
        },
        outlined: {
          backgroundColor: 'rgba(212, 227, 223, 0.08)',
          '&:hover': {
            backgroundColor: 'rgba(35, 139, 125, 0.16)',
            borderColor: biotech.teal,
            color: biotech.teal,
          },
        },
        text: {
          borderColor: 'transparent',
          '&:hover': {
            backgroundColor: 'rgba(35, 139, 125, 0.12)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          transition: noCssTransition,
          '&:focus-visible': {
            outline: `2px solid ${biotech.teal}`,
            outlineOffset: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: `1px solid ${biotech.line}`,
          backgroundImage: 'none',
          backgroundColor: biotech.surfaceStrong,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&:last-child': {
            paddingBottom: 'inherit',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          backgroundImage: 'none',
          backgroundColor: biotech.surfaceStrong,
          color: biotech.ink,
        },
        outlined: {
          borderColor: biotech.line,
        },
        elevation1: {
          boxShadow: 'none',
          border: `1px solid ${biotech.line}`,
        },
        elevation2: {
          boxShadow: 'none',
          border: `1px solid ${biotech.line}`,
        },
        elevation3: {
          boxShadow: 'none',
          border: `1px solid ${biotech.line}`,
        },
        elevation4: {
          boxShadow: 'none',
          border: `1px solid ${biotech.line}`,
        },
        elevation5: {
          boxShadow: 'none',
          border: `1px solid ${biotech.line}`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 23,
          borderRadius: 0,
          border: `1px solid rgba(35, 139, 125, 0.4)`,
          backgroundColor: biotech.dataWash,
          color: biotech.tealDeep,
          fontFamily: fontSans,
          fontSize: '0.6875rem',
          fontWeight: 640,
          letterSpacing: '-0.002em',
          transition: noCssTransition,
          '&:focus-visible': {
            outline: `2px solid ${biotech.teal}`,
            outlineOffset: 2,
          },
          '&:hover': {
            borderColor: biotech.teal,
            backgroundColor: '#9FC1BA',
          },
        },
        label: {
          paddingLeft: 7,
          paddingRight: 7,
        },
        icon: {
          marginLeft: 5,
          marginRight: -2,
          color: 'currentColor',
        },
        colorPrimary: {
          borderColor: 'rgba(35, 139, 125, 0.5)',
          backgroundColor: biotech.dataWash,
          color: biotech.tealDeep,
        },
        colorSecondary: {
          borderColor: 'rgba(76, 92, 158, 0.48)',
          backgroundColor: biotech.indigoWash,
          color: biotech.indigoDeep,
        },
        colorError: {
          borderColor: 'rgba(168, 58, 74, 0.48)',
          backgroundColor: biotech.redWash,
          color: biotech.red,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: fontSans,
          transition: noCssTransition,
        },
        input: {
          '&::placeholder': {
            color: biotech.inkMuted,
            opacity: 0.82,
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            borderRadius: 0,
            backgroundColor: biotech.reading,
            fontFamily: fontSans,
            fontSize: '0.8125rem',
            transition: noCssTransition,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: biotech.line,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: biotech.teal,
          },
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: biotech.teal,
          },
          '& .MuiInputLabel-root': {
            fontFamily: fontSans,
            fontSize: '0.6875rem',
            letterSpacing: 0,
            textTransform: 'none',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: biotech.reading,
          fontFamily: fontSans,
          transition: noCssTransition,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: biotech.line,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: biotech.teal,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: biotech.teal,
          },
        },
        input: {
          padding: '0.55rem 0.65rem',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontFamily: fontSans,
          fontSize: '0.6875rem',
          fontWeight: 620,
          letterSpacing: 0,
          textTransform: 'none',
          color: biotech.inkSoft,
          '&.Mui-focused': {
            color: biotech.tealDeep,
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: false,
      },
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
          border: `1px solid ${biotech.lineOnDarkStrong}`,
          backgroundColor: biotech.shellDeep,
          color: biotech.surfaceStrong,
          fontFamily: fontSans,
          fontSize: '0.6875rem',
          fontWeight: 520,
          letterSpacing: 0,
          boxShadow: 'none',
        },
        arrow: {
          color: biotech.shellDeep,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: `1px solid ${biotech.line}`,
          boxShadow: 'none',
          backgroundImage: 'none',
          backgroundColor: biotech.surfaceStrong,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: 4,
          borderRadius: 0,
          border: `1px solid ${biotech.line}`,
          boxShadow: 'none',
          backgroundColor: biotech.surfaceStrong,
        },
        list: {
          paddingTop: 4,
          paddingBottom: 4,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 30,
          padding: '0.35rem 0.6rem',
          fontSize: '0.75rem',
          letterSpacing: 0,
          transition: noCssTransition,
          '&:hover': {
            backgroundColor: biotech.dataWash,
          },
          '&.Mui-selected': {
            backgroundColor: biotech.indigoWash,
            '&:hover': {
              backgroundColor: '#B9C1DF',
            },
          },
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid ${biotech.lineOnDarkStrong}`,
          boxShadow: 'none',
          backgroundColor: biotech.shellDeep,
          color: biotech.surfaceStrong,
          fontFamily: fontSans,
          fontSize: '0.75rem',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          border: `1px solid ${biotech.line}`,
          boxShadow: 'none',
          fontSize: '0.75rem',
        },
        icon: {
          alignItems: 'center',
        },
        message: {
          padding: 0,
        },
        standardError: {
          borderColor: 'rgba(168, 58, 74, 0.46)',
          backgroundColor: biotech.redWash,
          color: biotech.red,
        },
        standardWarning: {
          borderColor: 'rgba(155, 106, 47, 0.46)',
          backgroundColor: biotech.amberWash,
          color: biotech.amber,
        },
        standardSuccess: {
          borderColor: 'rgba(52, 126, 93, 0.42)',
          backgroundColor: biotech.greenWash,
          color: biotech.green,
        },
        standardInfo: {
          borderColor: 'rgba(35, 139, 125, 0.42)',
          backgroundColor: biotech.dataWash,
          color: biotech.tealDeep,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: biotech.line,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '0.45rem 0.55rem',
          borderBottom: `1px solid ${biotech.line}`,
          fontSize: '0.75rem',
        },
        head: {
          fontFamily: fontSans,
          fontSize: '0.6875rem',
          fontWeight: 680,
          letterSpacing: 0,
          textTransform: 'none',
          color: biotech.inkSoft,
          backgroundColor: biotech.surfaceMuted,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: noCssTransition,
          '&:hover': {
            backgroundColor: biotech.dataWash,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 32,
          borderBottom: `1px solid ${biotech.line}`,
        },
        indicator: {
          height: 2,
          backgroundColor: biotech.teal,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 32,
          padding: '0.35rem 0.65rem',
          fontFamily: fontSans,
          fontSize: '0.6875rem',
          fontWeight: 680,
          letterSpacing: 0,
          textTransform: 'none',
          color: biotech.inkSoft,
          transition: noCssTransition,
          '&.Mui-selected': {
            color: biotech.tealDeep,
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: biotech.surfaceMuted,
          '&::after': {
            background:
              'linear-gradient(90deg, transparent, rgba(35, 139, 125, 0.16), transparent)',
          },
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(16, 44, 46, 0.72)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          border: `1px solid ${biotech.line}`,
          boxShadow: 'none',
          backgroundImage: 'none',
          backgroundColor: biotech.surfaceStrong,
        },
      },
    },
  },
});

export default theme;
