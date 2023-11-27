import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
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
import { getFirestore, collection, getDocs, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Loading from "./Loading";

const UserViewBooks = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (book) => {
    if (selectedDepartment === "All" || book.department === selectedDepartment) {
      setSelectedBook(book);
      setOpenModal(true);
    }
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
      setLoading(true);
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
    } finally{
      setLoading(false);
    }
  } 
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        const booksCollection = collection(db, "books");
        const booksSnapshot = await getDocs(booksCollection);
        const booksData = booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const filteredBooks = booksData.filter(
          (book) => selectedDepartment === "All" || book.department === selectedDepartment
        );

        setBooks(filteredBooks);
      } catch (error) {
        console.error("Error fetching books:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [selectedDepartment]);

  const handleDepartmentFilter = (department) => {
    setSelectedDepartment(department);
  };

  return (
    <Container>
      <div className="filter-button-container"   style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "100%",
          marginBottom: "50px",
          marginTop: "80px",
        }}>
        <Typography variant="h4" gutterBottom>
          View Books
        </Typography>
        <Button
          className="filter-button"
          variant={selectedDepartment === "All" ? "contained" : "outlined"}
          onClick={() => handleDepartmentFilter("All")}
        >
          All
        </Button>
        <Button
          className="filter-button"
          variant={
            selectedDepartment === "Information Technology"
              ? "contained"
              : "outlined"
          }
          onClick={() => handleDepartmentFilter("Information Technology")}
        >
          Information Technology
        </Button>
        <Button
          className="filter-button"
          variant={
            selectedDepartment === "Development Communication"
              ? "contained"
              : "outlined"
          }
          onClick={() => handleDepartmentFilter("Development Communication")}
        >
          Development Communication
        </Button>
        <Button
          className="filter-button"
          variant={selectedDepartment === "Tourism" ? "contained" : "outlined"}
          onClick={() => handleDepartmentFilter("Tourism")}
        >
          Tourism
        </Button>
        <Button
          className="filter-button"
          variant={
            selectedDepartment === "Hotel Management" ? "contained" : "outlined"
          }
          onClick={() => handleDepartmentFilter("Hotel Management")}
        >
          Hotel Management
        </Button>
        <Button
          className="filter-button"
          variant={
            selectedDepartment === "Education" ? "contained" : "outlined"
          }
          onClick={() => handleDepartmentFilter("Education")}
        >
          Education
        </Button>
      </div>
      <Grid container spacing={3}   sx={{ marginTop: "200px" }}>
        {loading ? (
          <Loading state={loading} size={30} />
        ) : (
          books.map((book) => (
            <Grid item key={book.id} xs={12} sm={6} md={4}>
              <Card height="500"
        sx={{ padding: "0", minHeight: "400px", minWidth:"300px"}}
                onClick={() => handleOpenModal(book)}
                style={{ cursor: "pointer" }}
              >
                <CardMedia
                
                  component="img"
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
          ))
        )}
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
            endIcon={<Loading state={loading} size={5} />}
          >
            Borrow
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default UserViewBooks;
