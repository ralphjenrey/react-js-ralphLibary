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
import { Link } from "react-router-dom";

const UserSidebar = ({ open, onClose, onMenuButtonClick ,isAuthenticated}) => {
  const [openLibrary, setOpenLibrary] = React.useState(false);


  const handleLibraryClick = () => {
    setOpenLibrary(!openLibrary);
  };

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      console.log("Logout successful");
      // Redirect to the login page after successful logout
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error.message);
    }
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

        <ListItem component={Link} to="/user-home">
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>

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
            <ListItem  button component={Link} to="/user-books">
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="View Books" />
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

export default UserSidebar;
