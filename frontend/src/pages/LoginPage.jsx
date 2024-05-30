import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from "@mui/material";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs} from 'firebase/firestore';



const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      if (!email || !password) {
        setError("Please fill up all fields.");
        return;
      }
      const db = getFirestore();
      const auth = getAuth();
      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where("email", "==", email));
      const querySnapshot = await getDocs(userQuery);
      
      if (querySnapshot.empty) {
        // User not found
        setError("User not found.");
        return;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userRole = userDoc.data().role;
      const deletionTimestamp = userDoc.data().deletionTimestamp;
      
      // Check for deletionTimestamp in the user document
      if (deletionTimestamp) {
        setError("This account has been deleted. Please contact administrator for support");
        return;
      }
      
      // Authenticate the user if deletionTimestamp is not present
      await signInWithEmailAndPassword(auth, email, password);
      
      // Continue with role-based navigation
      if (userRole === 'Admin') {
        navigate("/admin-home");
      } else if (userRole === 'Staff') {
        navigate("/staff-home");
      } else {
        navigate("/user-home");
      }
      
      console.log("Login successful");
    } catch (error) {
      setError("Incorrect email or password.");
      console.error("Login failed", error.message);
    }
  };
  

  return (
    <Container component="main" maxWidth="xs" sx={{ border: "1px solid #ccc", borderRadius: "8px", padding: "16px" }}>
     
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h4">
          Login
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          {/* Email Input */}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            
          />

          {/* Password Input */}
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
           
          />

          {/* Error Alert */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Login Button */}
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
