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
  FormControlLabel,
  RadioGroup,
  Radio,
  Alert,
  Container,
} from "@mui/material";
import Loading from "../components/Loading";
import ManageAccountsIcon from "@mui/icons-material/AccountCircle";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDoc, collection, getFirestore } from "firebase/firestore";

const AddBooks = ({ open, onClose, handleAddBooksClick }) => {
  const [bookName, setBookName] = useState("");
  const [author, setAuthor] = useState("");
  const [quantity, setQuantity] = useState("");
  const [bookImage, setBookImage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [department, setDepartment] = useState("");
  const [imageSourceType, setImageSourceType] = useState("url");
  const [isImageValid, setIsImageValid] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageSourceTypeChange = (event) => {
    setImageSourceType(event.target.value);
    console.log(imageSourceType);
    setBookImage(""); // Clear the selected book image when changing source type
    setImagePreview(null); // Clear the image preview
    setIsImageValid(true); // Reset image validation
  };

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
    if (imageSourceType === "url") {
      const imageUrl = event.target.value;
      setBookImage(imageUrl);
      // Validate image URL
      const img = new Image();
      img.src = imageUrl;
  
      img.onload = () => {
        setIsImageValid(true);
        setBookImage(imageUrl);
        setError(""); // Clear any previous error
      };
  
      img.onerror = () => {
        setIsImageValid(false);
        setError("Please enter a valid image URL.");
      };
    } else {
      const selectedImage = event.target.files[0];
  
      if (selectedImage) {
        const imageURL = URL.createObjectURL(selectedImage);
        setImagePreview(imageURL);
        setIsImageValid(true);
        setBookImage(selectedImage);
        setError(""); // Clear any previous error
      } else {
        setIsImageValid(false);
        setBookImage("");
        setImagePreview(null);
        setError("Please select a valid image file.");
      }
    }
  
  
  };
  
  

  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
  };

  const handleAddButtonClick = async () => {
   
    const db = getFirestore();
    const storage = getStorage();
    let bookDetails ={};
    try {
      setLoading(true);
      if (!bookName || !author || !quantity || !department || !bookImage) {
        setError("Please fill up all fields");
        setLoading(false);
        return;
      }
      // Upload book image to storage
      if (typeof bookImage === 'string' && bookImage.startsWith('http')) {
        bookDetails = {
          bookName,
          author,
          quantity,
          department,
          bookImage: bookImage,
        };
      } else {
        
        // It's not a URL, assume it's a File object and proceed with the upload
        const storageRef = ref(storage, `book_images/${bookName}_${Date.now()}`);
        await uploadBytes(storageRef, bookImage);
         // Get the download URL for the uploaded image
      const downloadURL = await getDownloadURL(storageRef);
      bookDetails = {
        bookName,
        author,
        quantity,
        department,
        bookImage: downloadURL,
      };
      }

     
     
      // Add book details to Firestore collection
      const docRef = await addDoc(collection(db, "books"), bookDetails);

      console.log("Book added with ID:", docRef.id);

      // Reset form fields
      setBookName("");
      setAuthor("");
      setQuantity("");
      setDepartment("");
      setBookImage("");
      setImagePreview(null);
      setLoading(false);
      setError("");
    } catch (e) {
      setError("Error adding book:", e);
      console.error("Error adding book:", e);
      setLoading(false);
    }
  };

  return (
    <Container  maxWidth="xs"> 
<List>
      <ListItem>
        <ListItemIcon>
          <ManageAccountsIcon />
        </ListItemIcon>
        <ListItemText
          sx={{ fontSize: "300" }}
          primary="Add Books"
        />
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
            <MenuItem value="Information Technology">
              Information Technology
            </MenuItem>
            <MenuItem value="Development Communication">
              Development Communication
            </MenuItem>
            <MenuItem value="Hotel Management">Hotel Management</MenuItem>
            <MenuItem value="Education">Education</MenuItem>
            <MenuItem value="Tourism">Tourism</MenuItem>
          </Select>
        </FormControl>
      </ListItem>
      <ListItem>
        <RadioGroup
          row
          aria-label="image-source-type"
          name="image-source-type"
          value={imageSourceType}
          onChange={handleImageSourceTypeChange}
          sx={{ margin: "10px" }}
        >
          <FormControlLabel
           
            value="url"
            control={<Radio />}
            label="Book Image URL"
          />
          <FormControlLabel
           
            value="upload"
            control={<Radio />}
            label="Upload Image"
          />
        </RadioGroup>
      </ListItem>
      <ListItem>
        {imageSourceType === "url" ? (
          <TextField
            sx={{ margin: "10px" }}
            label="Book Image URL"
            value={bookImage}
            onChange={handleBookImageChange}
            error={!isImageValid}
            helperText={!isImageValid ? "Please enter a valid image URL." : ""}
          />
        ) : (
          <input
            type="file"
            accept="image/*"
            onChange={handleBookImageChange}
            sx={{ margin: "10px" }}
          />
        )}
      </ListItem>
      <ListItem>
        <img
          src={imagePreview}
          alt="Book Preview"
          style={{ maxWidth: "100%", maxHeight: "200px" }}
        />
      </ListItem>
      <ListItem>{error && <Alert severity="error">{error}</Alert>}</ListItem>
      <ListItem>
        <Button
          variant="contained"
          color="primary"
          endIcon={<Loading state={loading} size={10} />}
          onClick={handleAddButtonClick}
        >
          Add Book
        </Button>
      </ListItem>
    </List>
    </Container>
    
  );
};

export default AddBooks;
