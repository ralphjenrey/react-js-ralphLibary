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


const BorrowedBooks = () => {
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  const fetchBorrowedBooks = async () => {
    const db = getFirestore();
    const borrowedCollection = collection(db, "borrowed");
  
    try {
      const snapshot = await getDocs(borrowedCollection);
      const borrowedBooksData = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          books: data.books.filter((book) => book.approval === "approved"),
        };
      });
  
      setBorrowedBooks(borrowedBooksData);
    } catch (error) {
      console.error("Error fetching borrowed books:", error.message);
    }
  };
  
  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

 
  const handleReturnBook = async (borrowedId, bookId, bookName, fetchBorrowedBooks) => {
    const db = getFirestore();
  
    try {
      // Find the book in the 'books' collection by bookName
      const booksCollection = collection(db, "books");
      const bookDocRef = doc(booksCollection, bookId);
      const bookDoc = await getDoc(bookDocRef);
  
      if (bookDoc.exists()) {
        // Get the current quantity of the book
        const currentQuantity = bookDoc.data().quantity;
  
        // Update the 'books' collection to increment the quantity by 1
        await updateDoc(doc(booksCollection, bookId), {
          quantity: currentQuantity + 1,
        });
  
        // Update the book in the 'borrowed' collection
        const borrowedDocRef = doc(db, "borrowed", borrowedId);
        await updateDoc(borrowedDocRef, {
          books: borrowedBooks
            .find((user) => user.id === borrowedId)
            .books.map((book) => {
              if (book.bookName === bookName) {
                // Update the approval status to "returned"
                return {
                  ...book,
                  approval: "returned",
                  dateTimeReturned: new Date(),
                };
              }
              return book;
            }),
        });
  
        // Fetch the updated borrowed books data
        fetchBorrowedBooks();
      } else {
        console.error("Book not found in the 'books' collection.");
      }
    } catch (error) {
      console.error("Error returning book:", error.message);
    }
  };
  
  return (
    <div>
      <h2 style={{color: "black"}}>Borrowed Books</h2>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
            <TableCell>Borrowed ID</TableCell>
              <TableCell>Book Title</TableCell>
              <TableCell>Borrower</TableCell>
              <TableCell>Requested Date</TableCell>
              <TableCell>Approved Date</TableCell>
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
                  <TableCell>{format(book.dateTimeApproved.toDate(), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell>
                    <Button variant="contained" onClick={() => handleReturnBook(user.id, book.bookDocId, book.bookName)}>Return Book</Button>
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

export default BorrowedBooks;
