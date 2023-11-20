const express = require('express');
const bcrypt = require('bcrypt'); // Install bcrypt if not already installed
const admin = require('./firebaseAdmin');


const router = express.Router();


router.post('/updateAccount', async (req, res) => {
  try {
    const { users } = req.body;

    // Initialize Firestore and Auth
    const db = admin.firestore();
    const usersCollection = db.collection('users');
    const auth = admin.auth();

    // Update each user in the Firestore collection and in Firebase Authentication
    for (const user of users) {
      const { docId, idNumber, email, role } = user;

      // Update user document in Firestore
      await usersCollection.doc(docId).update({
        idNumber,
        email,
        role,
      });

      // Get user by UID from Firebase Authentication
      const userRecord = await auth.getUser(docId);

      // Update user's email in Firebase Authentication
      await auth.updateUser(docId, {
        email,
        displayName: idNumber,
      });
    }

    res.status(200).json({ message: 'Users updated successfully' });
  } catch (error) {
    console.error('Error updating users:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/createAccount', async (req, res) => {
  
  try {
    const { idNumber, email, role, password } = req.body;
    // Hash the password before storing it (use bcrypt or a similar library)
   

    // Create user in Firebase Authentication
    const auth = admin.auth();
    const userRecord = await auth.createUser({
      email,
      password: password,
      displayName: idNumber, 
    });

    // Initialize Firestore
    const db = admin.firestore();
    const users = db.collection('users');

    // Set the document using the UID as the document ID and add additional user information
    await users.doc(userRecord.uid).set({
      uid: userRecord.uid,
      idNumber,
      email,
      role,
    });

    console.log("User registered successfully:", userRecord.uid);
    res.status(201).json({ message: 'User registered successfully', uid: userRecord.uid });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/deleteAccount', async (req, res) => {
  try {
    const { userIDs } = req.body;

    // Initialize Firestore
    const db = admin.firestore();
    const usersCollection = db.collection('users');

    // Delete selected users and their documents
    for (const userID of userIDs) {
      // Delete user from Firebase Authentication
      await admin.auth().deleteUser(userID);

      // Delete user document from Firestore
      await usersCollection.doc(userID).delete();
    }

    res.status(200).json({ message: 'Users deleted successfully' });
  } catch (error) {
    console.error('Error deleting users:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
