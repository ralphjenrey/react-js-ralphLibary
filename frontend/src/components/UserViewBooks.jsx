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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";

import { getFirestore, collection, getDocs,doc,setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

const UserViewBooks = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const handleOpenModal = (book) => {
    setSelectedBook(book);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setError(null);
    setOpenModal(false);
  };

  const handleBorrowButtonClick = async () => {
    setError(null);
    const auth = getAuth();
    const user = auth.currentUser;
  
    try {
      // Check if the user's UID already exists in the 'borrowed' collection
      const db = getFirestore();
      const borrowedRef = doc(db, 'borrowed', user?.uid);
      const borrowedDoc = await getDoc(borrowedRef);
  
      if (borrowedDoc.exists()) {
        // If the document exists, show an error message
        console.error('Error borrowing book: User already borrowed a book.');
        setError("Error borrowing book: User already borrowed a book.");
        // You can also display a user-friendly error message to the user
        return;
      }
  
      // Update the book quantity in Firestore
      const bookRef = doc(db, 'books', selectedBook?.id);
  
      // Decrease the book quantity by 1
      await updateDoc(bookRef, {
        quantity: selectedBook?.quantity - 1,
      });
  
      // Create or update the 'borrowed' collection
      if (user) {
        const borrowedRef = doc(db, 'borrowed', user.uid);
  
        if (borrowedDoc.exists()) {
          // If the document exists, update the existing data
          await updateDoc(borrowedRef, {
            books: [
              ...borrowedDoc.data().books,
              {
                bookName: selectedBook?.bookName,
                bookDocId: selectedBook?.id,
                email: user.email,
              },
            ],
          });
        } else {
          // If the document does not exist, create a new one
          await setDoc(borrowedRef, {
            books: [
              {
                bookName: selectedBook?.bookName,
                bookDocId: selectedBook?.id,
                email: user.email,
              },
            ],
          });
        }
      }
  
      // Customize the behavior when the "Borrow" button is clicked
      console.log("Borrowing book:", selectedBook?.bookName);
      // Add your additional borrowing logic here if needed
    } catch (error) {
      console.error('Error borrowing book:', error.message);
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
          <Grid item key={book.id} xs={12} sm={6} md={6}>
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
          <Typography variant="body1" sx={{ margin: "10px" }}>
            <strong>Book Name:</strong> {selectedBook?.bookName}
          </Typography>
          <Typography variant="body1" sx={{ margin: "10px" }}>
            <strong>Quantity:</strong> {selectedBook?.quantity}
          </Typography>
          <Typography variant="body1" sx={{ margin: "10px" }}>
            <strong>Author:</strong> {selectedBook?.author}
          </Typography>
          <Typography variant="body1" sx={{ margin: "10px" }}>
            <strong>Department:</strong> {selectedBook?.department}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            onClick={handleBorrowButtonClick}
            variant="contained"
            color="primary"
            sx={{ margin: "10px" }}
          >
            Borrow
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default UserViewBooks;
