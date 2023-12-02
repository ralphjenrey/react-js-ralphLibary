/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started


/* eslint-disable max-len */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.scheduledAccountDeletion = functions.pubsub.schedule("every 24 hours").timeZone("UTC").onRun(async (context) => {
  const currentTime = admin.firestore.Timestamp.now();
  const expirationTime = currentTime.toMillis() - 30 * 24 * 60 * 60 * 1000; // 30 days ago

  const usersToDelete = await db.collection("users").where("deletionTimestamp", "<=", expirationTime).get();

  const deletionPromises = [];

  usersToDelete.forEach((userDoc) => {
    const userId = userDoc.id;
    const deleteUserPromise = admin.auth().deleteUser(userId);
    deletionPromises.push(deleteUserPromise);

    // Optionally, delete the user document from Firestore as well
    const deleteDocPromise = db.collection("users").doc(userId).delete();
    deletionPromises.push(deleteDocPromise);
  });

  return Promise.all(deletionPromises);
});

/* eslint-enable max-len  */

