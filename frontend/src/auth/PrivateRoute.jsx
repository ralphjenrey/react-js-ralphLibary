import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDoc, doc } from 'firebase/firestore';

const Protect = ({ children, allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);

      if (!user) {
        navigate('/'); // Redirect to login page if not authenticated
        return;
      }

      try {
        const usersCollection = collection(db, 'users');
        const userDocRef = doc(usersCollection, user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserRole(userData.role);

          // Check if the user's role is allowed for this route
          if (allowedRoles.includes(userData.role)) {
            // Render the protected content if the role is allowed
            return;
          } 
        } else {
          console.error('User document not found');
          navigate('/'); // Redirect to login page if user document is not found
        }
      } catch (error) {
        console.error('Error fetching user document', error);
      }
    });

    return () => unsubscribe();
  }, [allowedRoles, navigate]);

  // Render the protected content if authenticated and the role is allowed
  return isAuthenticated && userRole && allowedRoles.includes(userRole) ? (
    <>{children}</>
  ) : null;
};

export default Protect;
