import React, { useState, useEffect } from "react";
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
} from "@mui/material";

import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import axios from "axios";

const DeleteAccount = () => {
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  const fetchAllUsers = async () => {
    const db = getFirestore();
    const usersCollection = collection(db, "users");

    try {
      const querySnapshot = await getDocs(usersCollection);
      const results = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        results.push({ ...userData, docId: doc.id });
      });
      setAllUsers(results);
    } catch (error) {
      console.error("Error fetching all users:", error.message);
      setError("Error fetching all users: " + error.message);
    }
  };

  useEffect(() => {
    // Fetch all users when the component mounts
    fetchAllUsers();
  }, [searchResults]);

  const handleSearch = async () => {
    setError(null); // Reset error state
    setSelectedItems([]);

    // Check if either idNumber or email is provided
    if (!idNumber && !email) {
      setError("Please provide ID Number or Email for the search.");
      setSearchResults([]);
      return;
    }

    const db = getFirestore();
    const usersCollection = collection(db, "users");

    // Create a query based on ID Number or Email
    const q = query(
      usersCollection,
      idNumber ? where("idNumber", "==", idNumber) : where("email", "==", email)
    );

    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.docs.length == 0) {
        setError("No results found");
        setSearchResults([]);
      }
      const results = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data();

        results.push({ ...userData, docId: doc.id });
        setSearchResults(results);
      });
    } catch (error) {
      console.error("Error searching for user:", error.message);
      setError("Error searching for user: " + error.message);
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
      const response = await axios.post(
        "http://localhost:4000/auth/deleteAccount",
        {
          userIDs: selectedItems,
        }
      );

      if (response.status === 200) {
        // Clear selected items
        setSelectedItems([]);
        // Trigger a search again to refresh the results
        handleSearch();
      } else {
        console.error(
          "Error disabling users:",
          response.data.error || "Unknown error"
        );
        setError(response.data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error disabling users:", error.message);
      setError(error.message);
    }
  };

  const handleRestore = async () => {
    if (selectedItems.length === 0) {
      setError("Please select a cell");
      // No items selected for restore
      return;
    }

    try {
      const db = getFirestore();

      // Loop through selectedItems and restore each user
      for (const userId of selectedItems) {
        const userRef = doc(db, "users", userId);

        // Delete the deletionTimestamp field from the user document
        await updateDoc(userRef, {
          deletionTimestamp: deleteField(),
        });
      }
      handleSearch();
      // Trigger a search again to refresh the results
      handleSearch();
    } catch (error) {
      console.error("Error restoring user:", error.message);
      setError("Error restoring user: " + error.message);
    }
  };

  return (
    <Container component="main">
      <div>
        <Typography variant="h4" gutterBottom>
          Delete Account
        </Typography>
        
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                
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
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={handleSearch}
            sx={{ marginTop: "20px" }}
          >
            Search
          </Button>

          {allUsers.length > 0 && searchResults <= 0 && (
            <TableContainer>
              <Typography variant="h5" gutterBottom sx={{ marginTop: "20px" }}>
                All Users
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>ID Number</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Deleted in 30 days</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allUsers.map((user) => (
                    <TableRow key={user.docId}>
                      <TableCell>{user.uid}</TableCell>
                      <TableCell>{user.idNumber}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.deletionTimestamp
                          ? (() => {
                              const timestamp = user.deletionTimestamp; // Assuming user.deletionTimestamp is a Firebase Timestamp
                              const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds

                              // Subtract 30 days
                              date.setDate(date.getDate() - 30);

                              // Output the updated date as a string
                              return date.toLocaleString();
                            })()
                          : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
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
                            setSelectedItems(
                              searchResults.map((item) => item.docId)
                            );
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>ID Number</TableCell>
                    <TableCell>Email</TableCell>
                    {allUsers.length > 0 && (
                      <TableCell>Deleted in 30 days</TableCell>
                    )}
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
                      {allUsers.length > 0 && (
                        <TableCell>
                          {user.deletionTimestamp
                            ? (() => {
                                const timestamp = user.deletionTimestamp; // Assuming user.deletionTimestamp is a Firebase Timestamp
                                const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds

                                // Subtract 30 days
                                date.setDate(date.getDate() - 30);

                                // Output the updated date as a string
                                return date.toLocaleString();
                              })()
                            : ""}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {selectedItems && (
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDelete}
                sx={{ marginTop: "20px" }}
              >
                Delete Account
              </Button>
              <Button variant="contained"   sx={{ marginTop: "20px" }} onClick={handleRestore}>
                Restore
              </Button>
              </div>
          )}
      
      </div>
    </Container>
  );
};

export default DeleteAccount;
