import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  Navigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import CreateAccount from "./pages/CreateAccount";
import DeleteAccount from "./pages/DeleteAccount";
import AdminHome from "./pages/AdminHome";
import "./App.css";
import UpdateAccount from "./pages/UpdateAccount";
import ViewBooks from "./components/ViewBooks";
import LoginPage from "./pages/LoginPage";
import Protect from "./auth/PrivateRoute";
import UserHome from "./pages/UserHome";
import StaffHome from "./pages/StaffHome";
import AddBooks from "./pages/AddBooks";
import BorrowedBooks from "./pages/BorrowedBooks";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import Profile from "./pages/Profile";
import RequestedBooks from "./pages/RequestedBooks";
import { lightTheme, darkTheme } from "./themes";
import { CssBaseline, ThemeProvider } from "@mui/material";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [theme, setTheme] = useState(
    localStorage.getItem('darkMode') === 'enabled' ? darkTheme : lightTheme
  );

  const toggleTheme = () => {
    const newMode = localStorage.getItem('darkMode') === 'enabled' ? 'disabled' : 'enabled';
    localStorage.setItem('darkMode', newMode);
    setTheme(newMode === 'enabled' ? darkTheme : lightTheme);
  };

  const auth = getAuth();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthenticated(!!user);

      if (!user) {
        setUserRole("");
        return;
      }

      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const usersDocRef = doc(usersCollection, user.uid);

      try {
        const userDoc = await getDoc(usersDocRef);

        if (userDoc.exists) {
          setUserRole(userDoc.data().role);
        }
      } catch (error) {
        console.log(error);
      }
    });
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };


  return (
    <ThemeProvider theme={theme}>
       <CssBaseline />
    <Router>
      <>
        <Protect allowedRoles={["Admin", "User", "Staff"]}>
        <Header onMenuButtonClick={toggleSidebar} toggleTheme={toggleTheme} isDarkMode={theme === darkTheme} />
        </Protect>

        <Protect allowedRoles={["Admin", "User", "Staff"]}>
          <Sidebar
            open={sidebarOpen}
            onClose={toggleSidebar}
            onMenuButtonClick={toggleSidebar}
          />
        </Protect>

        <Routes>
          <Route
            element={
              <Protect allowedRoles={["Admin"]}>
                <CreateAccount />
              </Protect>
            }
            path="/create-account"
          />
          <Route
            element={
              <Protect allowedRoles={["Admin"]}>
                <DeleteAccount />
              </Protect>
            }
            path="/delete-account"
          />
          <Route
            element={
              <Protect allowedRoles={["Admin"]}>
                <UpdateAccount />
              </Protect>
            }
            path="/update-account"
          />
          <Route
            element={
              <Protect allowedRoles={["Admin", "User", "Staff"]}>
                <ViewBooks />
              </Protect>
            }
            path="/view-books"
          />
          <Route
            element={
              <Protect allowedRoles={["Admin"]}>
                <AdminHome />
              </Protect>
            }
            path="/admin-home"
          />

          <Route
            element={
              <Protect allowedRoles={["Admin"]}>
                <AddBooks />
              </Protect>
            }
            path="/add-books"
          />

          <Route
            element={
              <Protect allowedRoles={["User"]}>
                <UserHome />
              </Protect>
            }
            path="/user-home"
          />
          <Route
            element={
              <Protect allowedRoles={["Staff"]}>
                <BorrowedBooks />
              </Protect>
            }
            path="/borrowed-books"
          />
          <Route
            element={
              <Protect allowedRoles={["Staff"]}>
                <RequestedBooks />
              </Protect>
            }
            path="/requested-books"
          />

          <Route
            element={
              <Protect allowedRoles={["Staff"]}>
                <StaffHome />
              </Protect>
            }
            path="/staff-home"
          />
          <Route
            path="/"
            element={
              authenticated ? (
                // If authenticated, check userRole and navigate accordingly
                userRole === "Admin" ? (
                  <Navigate to="/admin-home" />
                ) : userRole === "Staff" ? (
                  <Navigate to="/staff-home" />
                ) : userRole === "User" ? (
                  <Navigate to="/user-home" />
                ) : (
                  // Handle other roles or unexpected cases
                  <Navigate to="/" />
                )
              ) : (
                // If not authenticated, show the login page
                <LoginPage />
              )
            }
          />
          <Route
            path="/profile"
            element={
              <Protect allowedRoles={["Staff", "Admin", "User"]}>
                <Profile auth={auth} />
              </Protect>
            }
          ></Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </>
    </Router>
    </ThemeProvider>
  );
}

export default App;
