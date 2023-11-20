import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Button,
  Input,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import ManageAccountsIcon from "@mui/icons-material/AccountCircle";
import {   getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, getFirestore } from "firebase/firestore";

const AddBooks = ({ open, onClose, handleAddBooksClick }) => {
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [bookImage, setBookImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [department, setDepartment] = useState("");

  const handleBookNameChange = (event) => {
    setBookName(event.target.value);
  };

  const handleAuthorChange = (event) => {
    setAuthor(event.target.value);
  };

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value);
  };

  const handleBookImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setBookImage(selectedImage);

    const imageURL = URL.createObjectURL(selectedImage);
    setImagePreview(imageURL);
  };

  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
  };

  const handleAddButtonClick = async () => {
    const db = getFirestore();
    const storage = getStorage();

    try {
      // Upload book image to storage
      const storageRef = ref(storage, `book_images/${bookName}_${Date.now()}`);
      await uploadBytes(storageRef, bookImage);

      // Get the download URL for the uploaded image
      const downloadURL = await getDownloadURL(storageRef);
      const bookDetails = {
        bookName,
        author,
        quantity,
        department,
        bookImage: downloadURL,
      };

      // Add book details to Firestore collection
      const docRef = await addDoc(collection(db, 'books'), bookDetails);

      console.log("Book added with ID:", docRef.id);

      // Reset form fields
      setBookName("");
      setAuthor("");
      setQuantity("");
      setDepartment("");
      setBookImage(null);
      setImagePreview(null);
    } catch (e) {
      console.error("Error adding book:", e);
    }
  };

  return (
    <List>
      <ListItem>
        <ListItemIcon>
          <ManageAccountsIcon />
        </ListItemIcon>
        <ListItemText primary="Add Books" />
      </ListItem>
      <ListItem>
        <TextField
          label="Book Name"
          value={bookName}
          onChange={handleBookNameChange}
        />
      </ListItem>
      <ListItem>
        <TextField
          label="Book Author"
          value={author}
          onChange={handleAuthorChange}
        />
      </ListItem>
      <ListItem>
        <TextField
          label="Book Quantity"
          value={quantity}
          onChange={handleQuantityChange}
        />
      </ListItem>
      <ListItem>
        <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">Department</InputLabel>
    <Select
   labelId="demo-simple-select-label"
    label="Department" 
    value={department}
    onChange={handleDepartmentChange}
  >
    <MenuItem value="Information Technology">Information Technology</MenuItem>
    <MenuItem value="Development Communication">Development Communication</MenuItem>
    <MenuItem value="Hotel Management">Hotel Management</MenuItem>
    <MenuItem value="Education">Education</MenuItem>
    <MenuItem value="Tourism">Tourism</MenuItem>
  </Select>
  </FormControl>
</ListItem>
      <ListItem>
        <Input
          type="file"
          onChange={handleBookImageChange}
        />
      </ListItem>
      <ListItem>
        <img
          src={imagePreview}
          alt="Book Preview"
          style={{ maxWidth: "100%", maxHeight: "200px" }}
        />
      </ListItem>
      <ListItem>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddButtonClick}
        >
          Add Book
        </Button>
      </ListItem>
    </List>
  );
};

export default AddBooks;
