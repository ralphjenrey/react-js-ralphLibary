// Sidebar.js

import React from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import { useLocation } from "react-router-dom";
import PageviewIcon from "@mui/icons-material/Pageview";
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ManageAccountsIcon from "@mui/icons-material/AccountCircle";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import LogoutIcon from "@mui/icons-material/Logout";
import { signOut } from "firebase/auth";
import DeleteIcon from "@mui/icons-material/Delete";
import UpdateIcon from "@mui/icons-material/Update";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { Link, useNavigate } from "react-router-dom";
import CreateIcon from "@mui/icons-material/Create";
import { useEffect, useState } from "react";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, getDoc } from "firebase/firestore";
import SettingsIcon from '@mui/icons-material/Settings';
import "/public/assets/css/sidebar.css";

const Sidebar = ({ open, onClose, onMenuButtonClick }) => {
  const [openManageAccount, setOpenManageAccount] = useState(false);
  const [openLibrary, setOpenLibrary] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [userRole, setUserRole] = useState("");
  const location = useLocation();

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

  const handleManageAccountClick = () => {
    setOpenManageAccount(!openManageAccount);
  };

  const handleLibraryClick = () => {
    setOpenLibrary(!openLibrary);
  };

  const handleSettings = () => {
    setOpenSettings(!openSettings);
  };

  // Use the useNavigate hook to get the navigate function
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("Logout successful");

      // Use navigate to go to the login page after successful logout
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error.message);
    }
  };

  return (
    <Drawer variant="persistent" open={open} onClose={onClose}>
      <List className="sidebar-button-container">
        <ListItem>
          <ListItemIcon>
            <IconButton onClick={onMenuButtonClick}>
              <MenuIcon />
            </IconButton>
          </ListItemIcon>
        </ListItem>

        <ListItem
          className={`${
            location.pathname === `/${userRole.toLowerCase()}-home`
              ? "sidebar-button"
              : ""
          }`}
          component={Link}
          to={`/${userRole.toLowerCase()}-home`}
          sx={{
            cursor: "pointer",
            margin: "10px auto",
          }}
        >
          <ListItemIcon>
            <HomeIcon
              className="sidebar-icon"
              sx={{
                color:
                  location.pathname === `/${userRole.toLowerCase()}-home`
                    ? "white"
                    : "gray",
              }}
            />
          </ListItemIcon>

          <ListItemText className="sidebar-text" primary="Home" />
        </ListItem>

        {userRole === "Admin" && (
          <>
            <ListItem
              className={`${
                location.pathname === "/create-account" ||
                location.pathname === "/delete-account" ||
                location.pathname === "/update-account"
                  ? "sidebar-button"
                  : ""
              }`}
              sx={{
                cursor: "pointer",
                margin: "10px auto",
              }}
              onClick={handleManageAccountClick}
            >
              <ListItemIcon>
                <ManageAccountsIcon
                  className="sidebar-icon"
                  sx={{
                    color:
                      location.pathname === "/create-account" ||
                      location.pathname === "/delete-account" ||
                      location.pathname === "/update-account"
                        ? "white"
                        : "gray",
                  }}
                />
              </ListItemIcon>
              <ListItemText primary="Manage Account" />
              {openManageAccount ? <ExpandLess /> : <ExpandMore />}
            </ListItem>

            {/* Submenu for Manage Account */}
            <Collapse in={openManageAccount} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* Use Link to navigate to different routes */}
                <ListItem
                  component={Link}
                  to="/create-account"
                  className="sidebar-submenu"
                >
                  <ListItemIcon>
                    <CreateIcon className="sidebar-icon" />
                  </ListItemIcon>
                  <ListItemText primary="Create Account" />
                </ListItem>
                <ListItem
                  component={Link}
                  to="/delete-account"
                  className="sidebar-submenu"
                >
                  <ListItemIcon>
                    <DeleteIcon className="sidebar-icon" />
                  </ListItemIcon>
                  <ListItemText primary="Delete Account" />
                </ListItem>
                <ListItem
                  component={Link}
                  to="/update-account"
                  className="sidebar-submenu"
                >
                  <ListItemIcon>
                    <UpdateIcon className="sidebar-icon" />
                  </ListItemIcon>
                  <ListItemText primary="Update Account" />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}

        <ListItem
          onClick={handleLibraryClick}
          className={`${
            location.pathname === "/view-books" ||
            location.pathname === "/add-books" ||
            location.pathname === "/borrowed-books" ||
            location.pathname === "/requested-books"
              ? "sidebar-button"
              : ""
          }`}
          sx={{
            cursor: "pointer",
            margin: "10px auto",
          }}
        >
          <ListItemIcon>
            <ImportContactsIcon
              className="sidebar-icon"
              sx={{
                color:
                  location.pathname === "/view-books" ||
                  location.pathname === "/add-books" ||
                  location.pathname === "/borrowed-books" ||
                  location.pathname === "/requested-books"
                    ? "white"
                    : "gray",
              }}
            />
          </ListItemIcon>
          <ListItemText primary="Library" />
          {openLibrary ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        <Collapse in={openLibrary} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              component={Link}
              to="/view-books"
              className="sidebar-submenu"
            >
              <ListItemIcon>
                <PageviewIcon />
              </ListItemIcon>
              <ListItemText primary="View Books" />
            </ListItem>

            {userRole === "Admin" && (
              <ListItem
                component={Link}
                to="/add-books"
                className="sidebar-submenu"
              >
                <ListItemIcon>
                  <CreateIcon />
                </ListItemIcon>
                <ListItemText primary="Add Books" />
              </ListItem>
            )}
            {userRole === "Staff" && (
              <ListItem
                component={Link}
                to="/borrowed-books"
                className="sidebar-submenu"
              >
                <ListItemIcon>
                  <AssignmentReturnIcon />
                </ListItemIcon>
                <ListItemText primary="Borrowed Books" />
              </ListItem>
            )}
            {userRole === "Staff" && (
              <ListItem
                component={Link}
                to="/requested-books"
                className="sidebar-submenu"
              >
                <ListItemIcon>
                  <ReceiptIcon />
                </ListItemIcon>
                <ListItemText primary="Requested Books" />
              </ListItem>
            )}
          </List>
        </Collapse>

        <ListItem
          onClick={handleSettings}
          className={`${
            location.pathname === "/profile" ? "sidebar-button" : ""
          }`}
          sx={{
            cursor: "pointer",
            margin: "10px auto",
          }}
        >
          <ListItemIcon>
            <SettingsIcon
              className="sidebar-icon"
              sx={{
                color: location.pathname === "/profile" ? "white" : "gray",
              }}
            />
          </ListItemIcon>
          <ListItemText primary="Settings" />
          {openSettings ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        <Collapse in={openSettings} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem
              component={Link}
              to="/profile"
              className="sidebar-submenu"
            >
              <ListItemIcon>
                <ManageAccountsIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
          </List>
        </Collapse>

        {/* Logout */}
        <ListItem
          onClick={handleLogout}
          sx={{
            cursor: "pointer",
            margin: "10px auto",
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
