import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Color palette options
const colorOptions = {
  blue: {
    light: '#1976d2',
    main: '#1565c0',
    dark: '#0d47a1',
  },
  purple: {
    light: '#9c27b0',
    main: '#7b1fa2',
    dark: '#4a148c',
  },
  teal: {
    light: '#009688',
    main: '#00796b',
    dark: '#004d40',
  },
  amber: {
    light: '#ffb300',
    main: '#ffa000',
    dark: '#ff8f00',
  },
  pink: {
    light: '#e91e63',
    main: '#d81b60',
    dark: '#ad1457',
  },
  green: {
    light: '#4caf50',
    main: '#388e3c',
    dark: '#1b5e20',
  },
  indigo: {
    light: '#3f51b5',
    main: '#3949ab',
    dark: '#283593',
  },
  red: {
    light: '#f44336',
    main: '#e53935',
    dark: '#c62828',
  },
  orange: {
    light: '#ff9800',
    main: '#fb8c00',
    dark: '#ef6c00',
  },
  deepPurple: {
    light: '#673ab7',
    main: '#5e35b1',
    dark: '#4527a0',
  },
};

// Create theme with mode and color
export const createAppTheme = (mode: PaletteMode, colorName: string): Theme => {
  const color = colorOptions[colorName as keyof typeof colorOptions] || colorOptions.blue;

  const baseTheme = createTheme({
    palette: {
      mode,
      primary: {
        light: color.light,
        main: color.main,
        dark: color.dark,
      },
      secondary: {
        light: mode === 'light' ? '#f5f5f5' : '#424242',
        main: mode === 'light' ? '#e0e0e0' : '#303030',
        dark: mode === 'light' ? '#bdbdbd' : '#212121',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      success: {
        main: '#4caf50',
      },
      warning: {
        main: '#ff9800',
      },
      error: {
        main: '#f44336',
      },
      info: {
        main: color.main,
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500,
        fontSize: '2.5rem',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 500,
        fontSize: '2rem',
        lineHeight: 1.2,
      },
      h3: {
        fontWeight: 500,
        fontSize: '1.75rem',
        lineHeight: 1.2,
      },
      h4: {
        fontWeight: 500,
        fontSize: '1.5rem',
        lineHeight: 1.2,
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.25rem',
        lineHeight: 1.2,
      },
      h6: {
        fontWeight: 500,
        fontSize: '1rem',
        lineHeight: 1.2,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: mode === 'light' 
              ? '0 2px 8px rgba(0,0,0,0.08)' 
              : '0 2px 8px rgba(0,0,0,0.4)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 42,
            height: 26,
            padding: 0,
            margin: 8,
          },
          switchBase: {
            padding: 1,
            '&.Mui-checked': {
              transform: 'translateX(16px)',
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: color.main,
                opacity: 1,
                border: 0,
              },
              '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: color.main,
              border: '6px solid #fff',
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
              color: mode === 'light' ? '#e0e0e0' : '#424242',
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: mode === 'light' ? 0.7 : 0.3,
            },
          },
          thumb: {
            width: 24,
            height: 24,
            boxShadow: 'none',
          },
          track: {
            borderRadius: 13,
            border: `1px solid ${mode === 'light' ? '#e0e0e0' : '#424242'}`,
            backgroundColor: mode === 'light' ? '#e0e0e0' : '#424242',
            opacity: 1,
            transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
  });

  return responsiveFontSizes(baseTheme);
};

// All available themes
export const themes = {
  light: {
    blue: createAppTheme('light', 'blue'),
    purple: createAppTheme('light', 'purple'),
    teal: createAppTheme('light', 'teal'),
    amber: createAppTheme('light', 'amber'),
    pink: createAppTheme('light', 'pink'),
    green: createAppTheme('light', 'green'),
    indigo: createAppTheme('light', 'indigo'),
    red: createAppTheme('light', 'red'),
    orange: createAppTheme('light', 'orange'),
    deepPurple: createAppTheme('light', 'deepPurple'),
  },
  dark: {
    blue: createAppTheme('dark', 'blue'),
    purple: createAppTheme('dark', 'purple'),
    teal: createAppTheme('dark', 'teal'),
    amber: createAppTheme('dark', 'amber'),
    pink: createAppTheme('dark', 'pink'),
    green: createAppTheme('dark', 'green'),
    indigo: createAppTheme('dark', 'indigo'),
    red: createAppTheme('dark', 'red'),
    orange: createAppTheme('dark', 'orange'),
    deepPurple: createAppTheme('dark', 'deepPurple'),
  },
};

// Get the default theme
export const getDefaultTheme = (): Theme => {
  return themes.light.blue;
};