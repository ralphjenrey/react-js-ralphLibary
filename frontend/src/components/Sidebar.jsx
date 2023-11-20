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
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import ManageAccountsIcon from "@mui/icons-material/AccountCircle";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import { getAuth, signOut } from "firebase/auth";
import { Link, useNavigate} from "react-router-dom";

const Sidebar = ({ open, onClose, onMenuButtonClick ,isAuthenticated}) => {
  const [openManageAccount, setOpenManageAccount] = React.useState(false);
  const [openLibrary, setOpenLibrary] = React.useState(false);
  

  const handleManageAccountClick = () => {
    setOpenManageAccount(!openManageAccount);
  };

  const handleLibraryClick = () => {
    setOpenLibrary(!openLibrary);
  };

  
  // Use the useNavigate hook to get the navigate function
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("Logout successful");

      // Use navigate to go to the login page after successful logout
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error.message);
    }
  };
  const [openAddBooks, setOpenAddBooks] = React.useState(false);

  const handleAddBooksClick = () => {
    setOpenAddBooks(!openAddBooks);
  };

  return (
    <Drawer variant="persistent" open={open} onClose={onClose} sx={{width: "200px"}}>
      <List>
        {/* IconButton with the Menu icon */}
        <ListItem>
          <ListItemIcon>
            <IconButton onClick={onMenuButtonClick}>
              <MenuIcon />
            </IconButton>
          </ListItemIcon>
        </ListItem>

        <ListItem component={Link} to="/admin-home">
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>

        {/* Manage Account with submenu */}
        <ListItem button onClick={handleManageAccountClick}>
          <ListItemIcon>
            <ManageAccountsIcon />
          </ListItemIcon>
          <ListItemText primary="Manage Account" />
          {openManageAccount ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        {/* Submenu for Manage Account */}
        <Collapse in={openManageAccount} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {/* Use Link to navigate to different routes */}
            <ListItem component={Link} to="/create-account">
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Create Account" />
            </ListItem>
            <ListItem component={Link} to="/delete-account">
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Delete Account" />
            </ListItem>
            <ListItem component={Link} to="/update-account">
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Update Account" />
            </ListItem>
          </List>
        </Collapse>

        {/* Library with submenu */}
        <ListItem button onClick={handleLibraryClick}>
          <ListItemIcon>
            <ManageAccountsIcon />
          </ListItemIcon>
          <ListItemText primary="Library" />
          {openLibrary ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        <Collapse in={openLibrary} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button component={Link} to="/view-books">
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="View Books" />
            </ListItem>

        
            <ListItem button component={Link} to="/add-books">
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Add Books" />
            </ListItem>

    
          </List>
        </Collapse>

        {/* Logout */}
        <ListItem button onClick={handleLogout}>
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
