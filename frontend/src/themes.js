// themes.js
import { createTheme } from "@mui/material/styles";


// Light mode theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2',
    },
    secondary: {
      main: '#FF4081',
    },
    background: {
      default: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif', // Include Poppins font
  },
});

// Dark mode theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90CAF9',
    },
    secondary: {
      main: '#FF80AB',
    },
    background: {
      default: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#CCCCCC',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif', // Include Poppins font
  },
});
