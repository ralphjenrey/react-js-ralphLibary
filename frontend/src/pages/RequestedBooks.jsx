//BorrowedBooks.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { getFirestore, collection, getDocs,doc, where, updateDoc, deleteDoc, getDoc } from "firebase/firestore";
import { format } from 'date-fns';


const RequestedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  const fetchRequestedBooks = async () => {
    const db = getFirestore();
    const borrowedCollection = collection(db, "borrowed");
  
    try {
      const snapshot = await getDocs(borrowedCollection);
      const borrowedBooksData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          books: data.books.filter((book) => book.approval === "pending"),
        };
      });
  
      setBorrowedBooks(borrowedBooksData);
    } catch (error) {
      console.error("Error fetching borrowed books:", error.message);
    }
  };

  useEffect(() => {
    fetchRequestedBooks();
  }, []);

 
  const handleApproval = async (borrowedId, bookId, bookName) => {
    const db = getFirestore();
  
    try {
      // Find the book in the 'books' collection by bookName
      const booksCollection = collection(db, "books");
      const bookDocRef = doc(booksCollection, bookId);
      const bookDoc = await getDoc(bookDocRef);
  
      if (bookDoc.exists()) {
        // Get the current quantity of the book
        const currentQuantity = bookDoc.data().quantity;
  
        // Ensure quantity is greater than 0 before decrementing
        if (currentQuantity > 0) {
          // Update the 'books' collection to decrement the quantity by 1
          await updateDoc(doc(booksCollection, bookId), {
            quantity: currentQuantity - 1,
          });
  
          // Update the returned book from the 'borrowed' collection
          const borrowedDocRef = doc(db, "borrowed", borrowedId);
          const borrowedDoc = await getDoc(borrowedDocRef);
  
          if (borrowedDoc.exists()) {
            const updatedBooks = borrowedDoc.data().books.map(book => {
              if (book.bookName === bookName) {
                // Update the approval status to "approved"
                return {
                  ...book,
                  approval: "approved",
                  dateTimeApproved: new Date(),
                };
              }
              return book;
            });
  
            // Update the 'borrowed' collection with the new 'books' array
            await updateDoc(borrowedDocRef, { books: updatedBooks });
            
            // Fetch the updated borrowed books data
            fetchRequestedBooks();
          } else {
            console.error("Borrowed document not found.");
          }
        } else {
          console.error("Book quantity is already zero.");
        }
      } else {
        console.error("Book not found in the 'books' collection.");
      }
    } catch (error) {
      console.error("Error returning book:", error.message);
    }
  };
  
  return (
    <div>
      <h2 style={{color: "black"}}>Request List</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell>Request ID</TableCell>
              <TableCell>Book Title</TableCell>
              <TableCell>Borrower</TableCell>
              <TableCell>Requested Date</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {borrowedBooks.map((user) =>
              user.books.map((book) => (
                <TableRow key={book.bookDocId}>
                  <TableCell>{book.bookDocId}</TableCell>
                  <TableCell>{book.bookName}</TableCell>
                  <TableCell>{book.email}</TableCell>
                  <TableCell>{format(book.dateTimeRequested.toDate(), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell>
                    <Button variant="contained" onClick={() => handleApproval(user.id, book.bookDocId, book.bookName)}>Approve Request</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default RequestedBooks;
