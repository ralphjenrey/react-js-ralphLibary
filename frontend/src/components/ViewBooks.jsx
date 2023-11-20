import React, { useState, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';

import {
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";

import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const ViewBooks = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [editedBookName, setEditedBookName] = useState("");
  const [editedQuantity, setEditedQuantity] = useState("");
  const [editedAuthor, setEditedAuthor] = useState("");
  const [editedBookImage, setEditedBookImage] = useState("");
  const [editedDepartment, setEditedDepartment] = useState("");
  const [isImageValid, setIsImageValid] = useState(true);
  const [imageSourceType, setImageSourceType] = useState("url");

  const handleOpenModal = (book) => {
    setSelectedBook(book);
    setEditedBookName(book.bookName);
    setEditedQuantity(book.quantity);
    setEditedAuthor(book.author);
    setEditedBookImage(book.bookImage);
    setEditedDepartment(book.department);
    setIsImageValid(true); // Reset image validation
    setImageSourceType("url"); // Reset image source type to URL
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleBookNameChange = (event) => {
    setEditedBookName(event.target.value);
  };

  const handleQuantityChange = (event) => {
    setEditedQuantity(event.target.value);
  };

  const handleAuthorChange = (event) => {
    setEditedAuthor(event.target.value);
  };

  const handleBookImageChange = (event) => {
    const input = event.target.value;
    setEditedBookImage(input);

    // Check if the entered image URL is a valid image
    const img = new Image();
    img.src = input;
    img.onload = () => setIsImageValid(true);
    img.onerror = () => setIsImageValid(false);
  };

  const handleDepartmentChange = (event) => {
    setEditedDepartment(event.target.value);
  };

  const handleImageSourceTypeChange = (event) => {
    setImageSourceType(event.target.value);
    setEditedBookImage(""); // Clear the edited book image when changing source type
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setEditedBookImage(reader.result);
      setIsImageValid(true); // Reset image validation
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateButtonClick = async () => {
    try {
      // Validate image before updating
      if (imageSourceType === "url" && !isImageValid) {
        alert("Please enter a valid image URL.");
        return;
      }

      const db = getFirestore();
      const bookRef = doc(db, 'books', selectedBook.id);

      // Update the book in Firestore with the edited values
      await updateDoc(bookRef, {
        bookName: editedBookName,
        quantity: editedQuantity,
        author: editedAuthor,
        bookImage: editedBookImage,
        department: editedDepartment,
        // Add other fields if needed
      });

      // Close the modal after a successful update
      handleCloseModal();
    } catch (error) {
      console.error('Error updating book:', error.message);
    }
  };

  useEffect(() => {
    // Function to fetch books from Firestore
    const fetchBooks = async () => {
      const db = getFirestore();
      const booksCollection = collection(db, 'books');
      const booksSnapshot = await getDocs(booksCollection);
      const booksData = booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBooks(booksData);
    };

    // Call the fetchBooks function when the component mounts
    fetchBooks();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        View Books
      </Typography>
      <Grid container spacing={3}>
        {books.map((book) => (
          <Grid item key={book.id} xs={12} sm={6} md={4}>
            <Card
              onClick={() => handleOpenModal(book)}
              style={{ cursor: "pointer" }}
            >
              <CardMedia
                component="img"
                height="400"
                image={book.bookImage}
                alt={book.bookName}
              />
              <CardContent>
                <Typography variant="h6" component="div">
                  {book.bookName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {book.author}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: {book.quantity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Department: {book.department}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Modal for Book Details */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>
          {selectedBook?.bookName}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseModal}
            aria-label="close"
            style={{ position: "absolute", top: 0, right: 10 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Book Name"
            value={editedBookName}
            onChange={handleBookNameChange}
            sx={{ margin: "10px" }}
          />
          <TextField
            sx={{ margin: "10px" }}
            label="Quantity"
            value={editedQuantity}
            onChange={handleQuantityChange}
          />
          <TextField
            sx={{ margin: "10px" }}
            label="Author"
            value={editedAuthor}
            onChange={handleAuthorChange}
          />
           <FormControl sx={{ margin: "10px" }}>
            <InputLabel id="department-label">Department</InputLabel>
            <Select
              labelId="department-label"
              label="Department"
              value={editedDepartment}
              onChange={handleDepartmentChange}
            >
              <MenuItem value="Information Technology">Information Technology</MenuItem>
              <MenuItem value="Development Communication">Development Communication</MenuItem>
              <MenuItem value="Hotel Management">Hotel Management</MenuItem>
              <MenuItem value="Education">Education</MenuItem>
              <MenuItem value="Tourism">Tourism</MenuItem>
            </Select>
          </FormControl>
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
          {imageSourceType === "url" ? (
            <TextField
              sx={{ margin: "10px" }}
              label="Book Image URL"
              value={editedBookImage}
              onChange={handleBookImageChange}
              error={!isImageValid}
              helperText={!isImageValid ? "Please enter a valid image URL." : ""}
            />
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e)}
              sx={{ margin: "10px" }}
            />
          )}
         
        </DialogContent>
        <Button onClick={handleUpdateButtonClick} color="primary" autoFocus>
          Update
        </Button>
      </Dialog>
    </Container>
  );
};

export default ViewBooks;
