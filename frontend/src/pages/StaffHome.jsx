// DashboardHome.js

import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, Container } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const StaffHome = () => {
  const [email, setEmail] = useState(null);
  const auth = getAuth();

  onAuthStateChanged(auth , (user) => {
    setEmail(user.email);
  });   


  return (
    <Container>
      <Typography variant="h1" gutterBottom>
        Staff Home
      </Typography>
      <Typography variant='h4'>Welcome, {email}</Typography>    
    </Container>
  );
};

export default StaffHome;
