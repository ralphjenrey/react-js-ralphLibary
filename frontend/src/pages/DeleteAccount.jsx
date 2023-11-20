import React, { useState } from 'react';
import { getAuth, deleteUser } from 'firebase/auth';

import {
  Checkbox,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
} from '@mui/material';

import { getFirestore, collection, getDocs, getDoc, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import axios from 'axios';

const DeleteAccount = () => {
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setError(null); // Reset error state

    // Check if either idNumber or email is provided
    if (!idNumber && !email) {
      setError('Please provide ID Number or Email for the search.');
      return;
    }

    const db = getFirestore();
    const usersCollection = collection(db, 'users');

    // Create a query based on ID Number or Email
    const q = query(
      usersCollection,
      idNumber
        ? where('idNumber', '==', idNumber)
        : where('email', '==', email),
    );

    try {
      const querySnapshot = await getDocs(q);
      const results = [];

      querySnapshot.forEach((doc) => {
        results.push({ ...doc.data(), docId: doc.id });
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for user:', error.message);
      setError('Error searching for user: ' + error.message);
    }
  };

  const handleCheckboxChange = (id) => {
    // Toggle the selection of the item
    setSelectedItems((prevSelectedItems) => {
      if (prevSelectedItems.includes(id)) {
        return prevSelectedItems.filter((itemId) => itemId !== id);
      } else {
        return [...prevSelectedItems, id];
      }
    });
  };

  const handleDelete = async () => {
    setError(null); // Reset error state
    console.log(selectedItems);
    try {
      const response = await axios.post('http://localhost:4000/auth/deleteAccount', {
        userIDs: selectedItems,
      });
  
      if (response.status === 200) {
        // Clear selected items
        setSelectedItems([]);
        // Trigger a search again to refresh the results
        handleSearch();
      } else {
        console.error('Error disabling users:', response.data.error || 'Unknown error');
        setError(response.data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error disabling users:', error.message);
      setError(error.message);
    }
  };

  return (
    <Container component="main">
      <div>
        <Typography variant="h4" gutterBottom>
          Delete Account
        </Typography>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ID Number"
                variant="outlined"
                id="idNumber"
                name="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                variant="outlined"
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>
          </Grid>
          {error && <Alert severity="error">{error}</Alert>}
          <Button type="button" variant="contained" color="primary" onClick={handleSearch}>
            Search
          </Button>

          {searchResults.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {/* Checkbox in the header */}
                      <Checkbox
                        checked={selectedItems.length === searchResults.length}
                        onChange={() => {
                          if (selectedItems.length === searchResults.length) {
                            setSelectedItems([]);
                          } else {
                            setSelectedItems(searchResults.map((item) => item.docId));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>ID Number</TableCell>
                    <TableCell>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.map((user) => (
                    <TableRow key={user.docId}>
                      <TableCell>
                        {/* Checkbox in each row */}
                        <Checkbox
                          checked={selectedItems.includes(user.docId)}
                          onChange={() => handleCheckboxChange(user.docId)}
                        />
                      </TableCell>
                      <TableCell>{user.uid}</TableCell>
                      <TableCell>{user.idNumber}</TableCell>
                      <TableCell>{user.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Button variant="contained" color="primary" onClick={handleDelete}>
            Delete Account
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default DeleteAccount;
