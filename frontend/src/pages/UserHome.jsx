// DashboardHome.js

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, Container } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const UserHome = () => {
  const auth = getAuth();
  const [email, setEmail] = useState(null);

  useEffect(() => {
    // Function to handle the callback when the authentication state changes
    const handleAuthChange = (user) => {
      // Update the email state when the authentication state changes
      setEmail(user ? user.email : null);
    };

    // Subscribe to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);

    // Cleanup function to unsubscribe when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [auth]);

  return (
    <Container>
      <Typography variant="h1" gutterBottom>
        User Home
      </Typography>
      <Typography variant='h4'>Welcome, {email}</Typography>    
    </Container>
  );
};

export default UserHome;
