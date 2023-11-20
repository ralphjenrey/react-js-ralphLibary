// Header.js

import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import isAuthenticated from '../auth/isAuthenticated';
const Header = ({ onMenuButtonClick}) => {
  
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    // Check Firebase authentication on component mount
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setAuth(authenticated);
    };

    checkAuth();
  }, []);
  
  return (
    <AppBar position="fixed" sx={{ width: '100%' }}>
      <Toolbar>
        {/* IconButton with the Menu icon */}
        {auth && (
          <IconButton edge="start" color="inherit" onClick={onMenuButtonClick}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Title in the center of the header */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
         Library
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
