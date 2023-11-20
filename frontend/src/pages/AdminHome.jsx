import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Container } from '@mui/material';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AdminHome = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCount, setUserCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();

        // Fetch user count based on role
        const userCount = await fetchRoleCount(db, 'User');
        setUserCount(userCount);

        // Fetch staff count based on role
        const staffCount = await fetchRoleCount(db, 'Staff');
        setStaffCount(staffCount);

        // Fetch admin count based on role
        const adminCount = await fetchRoleCount(db, 'Admin');
        setAdminCount(adminCount);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up Firebase Authentication listener
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Update current user state when authentication state changes
      setCurrentUser(user);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  const fetchRoleCount = async (db, role) => {
    const roleQuery = query(collection(db, 'users'), where('role', '==', role));
    const roleSnapshot = await getDocs(roleQuery);
    const roleMembers = roleSnapshot.docs.map(doc => doc.data());
    return roleMembers.length;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Welcome, {currentUser ? currentUser.email : 'Guest'}
      </Typography>
      <Grid container spacing={3}>
        {/* Users Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Number of Registered Users: {userCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Staff Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Staff
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Number of Registered Staff: {staffCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Admins Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div">
                Admins
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Number of Registered Admins: {adminCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminHome;
