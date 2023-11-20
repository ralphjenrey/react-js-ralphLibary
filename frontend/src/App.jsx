import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import CreateAccount from "./pages/CreateAccount";
import DeleteAccount from "./pages/DeleteAccount"; // Import your DeleteAccount component
import AdminHome from "./pages/AdminHome";
import "./App.css";
import UpdateAccount from "./pages/UpdateAccount";
import ViewBooks from "./components/ViewBooks";
import LoginPage from "./pages/LoginPage";
import Protect from "./auth/PrivateRoute";
import UserHome from "./pages/UserHome";
import UserSidebar from "./components/UserSidebar";
import StaffSidebar from "./components/StaffSidebar";
import StaffHome from "./pages/StaffHome";
import AddBooks from "./pages/AddBooks";
import UserViewBooks from "./components/UserViewBooks";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <>
        <Protect allowedRoles={["Admin", "User","Staff"]}>

        <Header onMenuButtonClick={toggleSidebar}/>
        </Protect>

        <Protect allowedRoles={["Admin"]}>
          <Sidebar
            open={sidebarOpen}
            onClose={toggleSidebar}
            onMenuButtonClick={toggleSidebar}
          />
        </Protect>

        <Protect allowedRoles={["User"]}>
          <UserSidebar
            open={sidebarOpen}
            onClose={toggleSidebar}
            onMenuButtonClick={toggleSidebar}
          />
        </Protect>

        

        <Protect allowedRoles={["Staff"]}>
          <StaffSidebar
            open={sidebarOpen}
            onClose={toggleSidebar}
            onMenuButtonClick={toggleSidebar}
          />
        </Protect>

        <Routes>
          <Route path="/" element={<LoginPage />} />
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
              <Protect allowedRoles={["Admin"]}>
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
          <Route element={ <Protect allowedRoles={["User"]}>
          <UserViewBooks></UserViewBooks>
        </Protect>} path="/user-books"/>
       
       

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
                <StaffHome />
              </Protect>
            }
            path="/staff-home"
          />

          <Route path="/" element={<LoginPage />} />
          {/* Add more routes as needed */}
        </Routes>
      </>
    </Router>
  );
}

export default App;
