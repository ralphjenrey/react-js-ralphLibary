// DashboardHome.js

import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid, Container } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const UserHome = () => {
  const auth = getAuth();
  const [email,setEmail] = useState(null);

  onAuthStateChanged(auth , (user) => {
    setEmail(user.email);
  });   

  return (
    <Container>
      <Typography sx={{color: "black"}} variant="h1" gutterBottom>
        User Home
      </Typography>
      <Typography variant='h4'>Welcome, {email}</Typography>    
    </Container>
  );
};

export default UserHome;
