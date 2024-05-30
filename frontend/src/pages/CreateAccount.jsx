import  { useState } from "react";
import {
  InputLabel,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  Alert,
  FormControl,
} from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

import axios from 'axios';

const CreateAccount = () => {
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(""); 
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleCreateAccount = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!idNumber || !email || !role || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      // Prepare the user data to send to the backend
      const userData = {
        idNumber,
        email,
        role,
        password,  // Send the password to the backend
      };
    
      // Send the user data to the backend
      const response = await axios.post('https://ralphlibsys.onrender.com/auth/createAccount', userData);

      // Handle the response from the backend
      if (response.status === 201 || response.status === 200) {
        console.log("User registered successfully:", response.data);
        setSuccess("User registered successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        console.error("Error registering user:", response.data.error || 'Unknown error');
        setError(response.data.error || 'Unknown error');
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("Error creating account:", error.message);
      setError(error.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <div>
        <Typography variant="h4" gutterBottom>
          Create Account
        </Typography>
        <form onSubmit={handleCreateAccount}>
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
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="role"
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value={"User"}>User</MenuItem>
                  <MenuItem value={"Staff"}>Staff</MenuItem>
                  <MenuItem value={"Admin"}>Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                variant="outlined"
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                variant="outlined"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Grid>
          </Grid>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Button type="submit" variant="contained" color="primary" sx={{marginTop: "20px"}}>
            Create Account
          </Button>
        </form>
      </div>
    </Container>
  );

  };
export default CreateAccount;
