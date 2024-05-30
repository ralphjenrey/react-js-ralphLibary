import  { useState } from "react";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import {
  DialogContent,
  IconButton,
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
  Dialog,
  DialogTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";


const UpdateAccount = () => {
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState(null);
  const [selectedValue, setSelectedValue] = useState(null);

  const handleSearch = async () => {
    setError(null); // Reset error state
    setModalError(null);

    // Check if either idNumber or email is provided
    if (!idNumber && !email) {
      setError("Please provide ID Number or Email for the search.");
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
      const results = [];

      querySnapshot.forEach((doc) => {
        results.push({ ...doc.data(), docId: doc.id });
      });

      if (results.length === 0) {
        setError("No user found."); // Set an error message if no users are found
      } else {
        setSearchResults(results);
      }
    } catch (error) {
      console.error("Error searching for user:", error.message);
      setError("Error searching for user: " + error.message);
    }
  };


  

  const handleOpenUpdateModal = (user) => {
    setSelectedUserForUpdate(user);
    setOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
  };
 

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleUpdate = async () => {
    setError(null); // Reset error state

    try {
      const updatedUsers = [];
      
      // Loop through search results and prepare data for update
      for (const user of searchResults) {
        const updatedIdNumber = document.getElementById(
          `updatedIdNumber-${user.docId}`
        ).value;
        const updatedEmail = document.getElementById(
          `updatedEmail-${user.docId}`
        ).value;
        const updatedRole = selectedValue;

        // document.getElementById(
        //   `updatedRole-${user.docId}`
        // ).value;

        console.log(updatedUsers);
        updatedUsers.push({
          docId: user.docId,
          idNumber: updatedIdNumber,
          email: updatedEmail,
          role: updatedRole,
        });
      }

      // Send data to the backend for update
      const response = await axios.post(
        "https://ralphlibsys.onrender.com/auth/updateAccount",
        {
          users: updatedUsers,
        }
      );

      // Check if the backend update was successful
      if (response.status === 200) {
        console.log("Successfully updated");
        // Close the update modal
        selectedValue(null);
        handleCloseUpdateModal();
        // Trigger a search again to refresh the results
        handleSearch();
      } else {
        // Handle errors from the backend
        console.error(
          "Error updating user on the backend:",
          response.data.message
        );
        setModalError(response.data.message);
      }
    } catch (error) {
      console.error("Error updating user:", error.message);
    }
  };

  return (
    <Container component="main">
      <div>
        <Typography variant="h4" gutterBottom>
          Update Account
        </Typography>
        <form>
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
          >
            Search
          </Button>

          {searchResults.length > 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>UID</TableCell>
                    <TableCell>ID Number</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.map((user) => (
                    <TableRow key={user.docId}>
                      <TableCell>{user.uid}</TableCell>
                      <TableCell>{user.idNumber}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => {
                            handleOpenUpdateModal(user);
                          }}
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {searchResults.length > 0 && (
            <Dialog open={openUpdateModal} onClose={handleCloseUpdateModal}>
              <DialogTitle>
                Update User
                <IconButton
                  edge="end"
                  color="inherit"
                  onClick={handleCloseUpdateModal}
                  aria-label="close"
                  style={{ position: "absolute", top: 0, right: 10 }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent>
                {selectedUserForUpdate && (
                  <div>
                    <TextField
                      fullWidth
                      label="ID Number"
                      variant="outlined"
                      id={`updatedIdNumber-${selectedUserForUpdate.docId}`}
                      defaultValue={selectedUserForUpdate.idNumber}
                      style={{ margin: "5px 0" }}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      variant="outlined"
                      id={`updatedEmail-${selectedUserForUpdate.docId}`}
                      type="email"
                      defaultValue={selectedUserForUpdate.email}
                      style={{ margin: "5px 0" }}
                    />
                          <FormControl
                  fullWidth
                  variant="outlined"
                  style={{ margin: "5px 0" }}
                >
                  <InputLabel
                    id={`role-select-label-${selectedUserForUpdate.docId}`}
                  >
                    Role
                  </InputLabel>
                  <Select
                    labelId={`role-select-label-${selectedUserForUpdate.docId}`}
                    id={`updatedRole-${selectedUserForUpdate.docId}`}
                    label="Role"
                    
                    value={selectedValue || (selectedUserForUpdate && selectedUserForUpdate.role)}
                    onChange={handleChange}
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="User">User</MenuItem>
                    <MenuItem value="Staff">Staff</MenuItem>
                  </Select>
                </FormControl>
                  </div>
                )}
              </DialogContent>
              {modalError && <Alert severity="error">{modalError}</Alert>}
              <Button
                onClick={handleUpdate}
                color="primary"
                variant="contained"
                sx={{ width: "80%", margin: "20px auto" }}
                autoFocus
              >
                Update
              </Button>
            </Dialog>
          )}
        </form>
      </div>
    </Container>
  );
};

export default UpdateAccount;
