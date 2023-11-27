import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import "/public/assets/css/ViewBooks.css";

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
  Alert,
} from "@mui/material";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { getAuth,onAuthStateChanged } from "firebase/auth";
import Loading from "./Loading";
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
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);


  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, get their UID
        const uid = user.uid;

        // Reference to the users collection
        const usersCollection = collection(getFirestore(), "users");

        // Reference to the specific user document
        const userDoc = doc(usersCollection, uid);

        try {
          // Fetch the user document
          const userSnapshot = await getDoc(userDoc);

          if (userSnapshot.exists()) {
            // Extract the role from the user document
            const userData = userSnapshot.data();
            const role = userData.role;

            // Update the state with the user's role
            setUserRole(role);
          } else {
            console.error("User document not found");
          }
        } catch (error) {
          console.error("Error fetching user document:", error.message);
        }
      } else {
        // User is signed out, handle accordingly
        setUserRole("");
      }
    });

    // Cleanup the subscription on component unmount
    return () => unsubscribe();
  }, []);

  const handleDepartmentFilter = (department) => {
    setSelectedDepartment(department);
  };

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
    setError("");
    setSuccess("");
    setOpenModal(false);
  };

  const fetchBooks = async () => {
    try {
      const db = getFirestore();
      const booksCollection = collection(db, "books");
      const booksSnapshot = await getDocs(booksCollection);
      const booksData = booksSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(booksData);
    } catch (error) {
      console.error("Error fetching books:", error.message);
    }
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
    handleFileUpload(event);
    // img.onload = () => setIsImageValid(true);
    // img.onerror = () => setIsImageValid(false);
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
  const handleBorrowButtonClick = async () => {
    setError(null);
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      // Check if the user's UID already exists in the 'borrowed' collection
      const db = getFirestore();
      const borrowedRef = doc(db, "borrowed", user?.uid);
      setLoading(true);
      const borrowedDoc = await getDoc(borrowedRef);

      if (borrowedDoc.exists()) {
        // If the document exists, show an error message
        console.error("Error borrowing book: User already borrowed a book.");
        setError("Error borrowing book: User already borrowed a book.");
        setSuccess("");
        // You can also display a user-friendly error message to the user
        return;
      }

      // Update the book quantity in Firestore
      const bookRef = doc(db, "books", selectedBook?.id);

      // Decrease the book quantity by 1
      await updateDoc(bookRef, {
        quantity: selectedBook?.quantity - 1,
      });

      // Create or update the 'borrowed' collection
      if (user) {
        const borrowedRef = doc(db, "borrowed", user.uid);

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
          await setDoc(borrowedRef,{
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
      setError("");
      setSuccess("Transaction Complete");
      // Customize the behavior when the "Borrow" button is clicked
      console.log("Borrowing book:", selectedBook?.bookName);
      // Add your additional borrowing logic here if needed
    } catch (error) {
      console.error("Error borrowing book:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteButtonClick = async () => {
    try {
      setLoading(true); // Set loading state to true

      const db = getFirestore();
      const bookRef = doc(db, "books", selectedBook.id);

      // Delete the book document from Firestore
      await deleteDoc(bookRef);

      // Close the modal after a successful delete
      fetchBooks();
      handleCloseModal();
    } catch (error) {
      console.error("Error deleting book:", error.message);
    } finally {
      setLoading(false); // Set loading state to false regardless of success or failure
    }
  };

  const handleUpdateButtonClick = async () => {
    try {
      // Validate image before updating
      if (imageSourceType === "url" && !isImageValid) {
        alert("Please enter a valid image URL.");
        return;
      }

      setLoading(true); // Set loading state to true

      const db = getFirestore();
      const bookRef = doc(db, "books", selectedBook.id);

      // Update the book in Firestore with the edited values
      await updateDoc(bookRef, {
        bookName: editedBookName,
        quantity: editedQuantity,
        author: editedAuthor,
        bookImage: editedBookImage,
        department: editedDepartment,
      });

      // Close the modal after a successful update
      fetchBooks();
      handleCloseModal();
    } catch (error) {
      console.error("Error updating book:", error.message);
    } finally {
      setLoading(false); // Set loading state to false regardless of success or failure
    }
  };

  useEffect(() => {
    // Function to fetch books from Firestore
    const fetchBooks = async () => {
      const db = getFirestore();
      const booksCollection = collection(db, "books");
      try {
        setLoading(true);
        const booksSnapshot = await getDocs(booksCollection);
        const booksData = booksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books:", error.message);
      } finally {
        setLoading(false); // Set loading state to false regardless of success or failure
      }
    };

    // Call the fetchBooks function when the component mounts
    fetchBooks();
  }, []);

  return (
    <Container className="card-container">
      <div
        className="filter-button-container"
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "100%",
          marginBottom: "50px",
          marginTop: "80px",
        }}
      >
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
      <Grid container spacing={3} sx={{ marginTop: "200px", justifyContent: "space-evenly"}}>
        {loading ? (
          <>
            <Loading state={loading} size={30} />
          </>
        ) : (
          books
            .filter(
              (book) =>
                selectedDepartment === "All" ||
                book.department === selectedDepartment
            )
            .map((book) => (
              <Grid item key={book.id} xs={12} sm={6} md={4}>
                <Card
                  height="500"
                  className="card"
                  sx={{ padding: "0", minHeight: "400px", minWidth: "300px" }}
                  onClick={() => {handleOpenModal(book)}}
                  style={{ cursor: "pointer" }}
                >
                  <CardMedia
                    className="card-img"
                    component="img"
                    image={book.bookImage}
                    alt={book.bookName}
                    sx={{ minWidth: "150px", maxHeight: "500px" }}
                  />
                  <CardContent className="card-description">
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
      {userRole === "Admin" && (
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
              helperText={
                !isImageValid ? "Please enter a valid image URL." : ""
              }
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
        {loading ? (
          <Loading state={loading} size={20} />
        ) : (
          <>
            <Button onClick={handleUpdateButtonClick} color="primary" autoFocus>
              Update
            </Button>
            <Button onClick={handleDeleteButtonClick} color="primary" autoFocus>
              Delete
            </Button>
          </>
        )}
      </Dialog>

      )}

{userRole === "User" && (
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
          {success && <Alert severity="success">{success}</Alert>}
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

)}
    </Container>
  );
};

export default ViewBooks;
