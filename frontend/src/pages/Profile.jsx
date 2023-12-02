import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Alert,
  Card,
  CardMedia,
} from "@mui/material";
import {
  getAuth,
  signInWithEmailAndPassword,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styled from "@emotion/styled";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";

const ProfilePictureContainer = styled(Box)`
  position: relative;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  margin: auto;
  cursor: pointer;
  background-color: gray;
  &:hover::before {
    content: "Change Profile Picture";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const RoundedInput = styled.input`
  display: none;
`;

const Profile = ({ auth }) => {
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        // Check if the user is currently signed in
        if (auth.currentUser) {
          const db = getFirestore();
          const userDocRef = doc(db, "users", auth.currentUser.uid);

          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            setImage(userData.photoURL);
          }
        } else {
        }
      } catch (error) {
        // Handle error
        console.error("Error fetching profile picture:", error.message);
      }
    };

    fetchProfilePicture();
  }, []);

  const handlePasswordChange = async () => {
    try {
      if (newPassword !== confirmPassword) {
        setError("New password and confirm password do not match");
        return;
      }
      const credentials = {
        email: auth.currentUser.email,
        password: currentPassword,
      };
     
      await signInWithEmailAndPassword(auth,
        credentials.email,
        credentials.password
      );
      await updatePassword(auth.currentUser, newPassword);
      setError(null);
      setNewPassword("");
      setCurrentPassword("");
      setConfirmPassword("");
      setSuccess("Password Change Successfully");
    } catch (error) {
      setError("Error updating password: " + error.message);
    }
  };

  const handlePictureChange = async (event) => {
    const file = event.target.files[0];

    if (file) {
      setImage(URL.createObjectURL(file));
      try {
        const auth = getAuth();
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `profilePictures/${auth.currentUser.uid}`
        );
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Update the photoURL field in the users collection
        const db = getFirestore();
        const userDocRef = doc(db, "users", auth.currentUser.uid);

        await updateDoc(userDocRef, {
          photoURL: downloadURL,
        });

        // Update the user profile with the new photoURL
        await updateProfile(auth.currentUser, { photoURL: downloadURL });

        setError(null);
      } catch (error) {
        setError("Error updating profile picture: " + error.message);
      }
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <Box>
        <ProfilePictureContainer
          onClick={() =>
            document.getElementById("profile-picture-input").click()
          }
        >
          <RoundedInput
            id="profile-picture-input"
            type="file"
            accept="image/*"
            onChange={handlePictureChange}
          />
          {image && (
            <Card>
              <CardMedia
                component="img"
                alt="Profile"
                height="140"
                image={image}
              />
            </Card>
          )}
        </ProfilePictureContainer>

        <Box>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <TextField
            margin="normal"
            fullWidth
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handlePasswordChange}
          >
            Change Password
          </Button>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
      </Box>
    </Container>
  );
};

export default Profile;
