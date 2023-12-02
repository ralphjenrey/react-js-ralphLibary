// themes.js
import { createTheme } from "@mui/material/styles";

// Light mode theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976D2', // Replace with your primary color
    },
    secondary: {
      main: '#FF4081', // Replace with your secondary color
    },
    background: {
      default: '#ffffff', // Replace with your background color
    },
    text: {
      primary: '#333333', // Replace with your text color
      secondary: '#666666', // Replace with your secondary text color
    },
  },
});

// Dark mode theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90CAF9', // Replace with your primary color
    },
    secondary: {
      main: '#FF80AB', // Replace with your secondary color
    },
    background: {
      default: '#121212', // Replace with your background color
    },
    text: {
      primary: '#ffffff', // Replace with your text color
      secondary: '#CCCCCC', // Replace with your secondary text color
    },
  },
});
