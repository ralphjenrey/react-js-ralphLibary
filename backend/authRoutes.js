const express = require("express");
const bcrypt = require("bcrypt"); // Install bcrypt if not already installed
const admin = require("./firebaseAdmin");
const { getFirestore } = require("firebase-admin/firestore");
const router = express.Router();

router.post("/updateAccount", async (req, res) => {
  try {
    const { users } = req.body;

    // Initialize Firestore and Auth
    const db = admin.firestore();
    const usersCollection = db.collection("users");
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

    res.status(200).json({ message: "Users updated successfully" });
  } catch (error) {
    console.error("Error updating users:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/createAccount", async (req, res) => {
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
    const users = db.collection("users");

    // Set the document using the UID as the document ID and add additional user information
    await users.doc(userRecord.uid).set({
      uid: userRecord.uid,
      idNumber,
      email,
      role,
    });

    console.log("User registered successfully:", userRecord.uid);
    res
      .status(201)
      .json({ message: "User registered successfully", uid: userRecord.uid });
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/deleteAccount", async (req, res) => {
  try {
    const { userIDs } = req.body;

    // Initialize Firestore
    const db = admin.firestore();
    const usersCollection = db.collection("users");

    const currentTime = admin.firestore.Timestamp.now();

    // Soft delete selected users by adding deletion timestamp
    for (const userID of userIDs) {
      // Get user document from Firestore
      const userDoc = await usersCollection.doc(userID).get();

      // Check if the user document exists and if it already has a deletionTimestamp
      if (userDoc.exists && !userDoc.data().deletionTimestamp) {
        // Update user document in Firestore with deletion timestamp
        await usersCollection.doc(userID).update({
          deletionTimestamp: currentTime,
        });
        await scheduledAccountDeletion();
        // Do something if the deletionTimestamp was added (e.g., additional actions)
        console.log(`User ${userID} soft deleted at ${currentTime}`);
      } else {
        console.log(`User ${userID} already soft deleted or does not exist`);
      }
    }

    res.status(200).json({ message: "Users soft deleted successfully" });
  } catch (error) {
    console.error("Error soft deleting users:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function scheduledAccountDeletion() {
  try {
    const db = getFirestore();
    const currentTime = admin.firestore.Timestamp.now();
    const expirationTime = currentTime.toMillis() - 30 * 24 * 60 * 60 * 1000; // 30 days ago

    const usersToDelete = await db.collection('users').where('deletionTimestamp', '<=', expirationTime).get();

    const deletionPromises = [];

    usersToDelete.forEach((userDoc) => {
      const userId = userDoc.id;
      const deleteUserPromise = admin.auth().deleteUser(userId);
      deletionPromises.push(deleteUserPromise);

      // Optionally, delete the user document from Firestore as well
      const deleteDocPromise = db.collection('users').doc(userId).delete();
      deletionPromises.push(deleteDocPromise);
    });

    return Promise.all(deletionPromises);
  } catch (error) {
    console.error('Error during scheduled account deletion:', error.message);
    throw error;
  }
}

module.exports = router;
