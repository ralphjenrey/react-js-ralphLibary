import { getAuth, onAuthStateChanged } from 'firebase/auth';

const isAuthenticated = () => {
  return new Promise((resolve) => {
    const auth = getAuth();
    
    onAuthStateChanged(auth, (user) => {
      // Resolve with the user object if authenticated, otherwise null
      resolve(user);
    });
  });
};

export default isAuthenticated;
