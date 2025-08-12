import React, { useState, useEffect, useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import ChatIcon from '@mui/icons-material/Chat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import Avatar from '@mui/material/Avatar';
import { Menu, MenuItem, Typography } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import './Sidebar.css';
import SidebarChat from './SidebarChat';
import CreateContactDialog from './CreateContactDialog';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = ({ setActiveChat }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setSearchTerm(e.target.value);

    if (e.target.value.length > 1) {
      handleSearch(e.target.value);
    } else {
      setResults([]);
    }
  };

  const handleSearch = async (term) => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:9000/api/auth/users?q=${term}`);
      setResults(res.data);
    } catch (err) {
      setResults([]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.length > 1) {
      handleSearch(searchTerm);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };


  return (
    <div className='sidebar'>
      <div className="sidebar_header">
        <Avatar src=''/>
        <div className="sidebar_headerRight">
          <IconButton>
            <DonutLargeIcon/>
          </IconButton>
          <IconButton onClick={() => setOpenDialog(true)}>
            <ChatIcon />
          </IconButton>

          <CreateContactDialog
            open={openDialog}
            handleClose={() => setOpenDialog(false)}
          />
          <>
          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon/>
          </IconButton>
          <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          style: { width: 250, padding: '10px' }
        }}
      >
        {user && (
          <div style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
            <Typography variant="subtitle1"><b>Name:</b> {user.name}</Typography>
            <Typography variant="subtitle2"><b>WA ID:</b> {user.wa_id}</Typography>
          </div>
        )}
        <MenuItem onClick={handleLogout} style={{ color: "red" }}>
          Logout
        </MenuItem>
      </Menu>
          </>
        </div>
      </div>

      <div className="sidebar_search">
        <div className="sidebar_searchContainer">
          <SearchOutlinedIcon/>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder='Search name or number'
              value={searchTerm}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
            />
          </form>
        </div>
      </div>

      <div className="sidebar_chats">
        {searchTerm.length > 1 ? (
          <>
            {loading && <div style={{ padding: "1rem" }}>Searching...</div>}
            {!loading && results.length === 0 && (
              <div style={{ padding: "1rem", color: "#888" }}>No users found.</div>
            )}
            {results.map(user => (
              <div
                key={user._id}
                className="sidebarChat"
                style={{ cursor: "pointer", padding: "1rem", borderBottom: "1px solid #eee" }}
                onClick={() => setActiveChat({
                  conversationId: user.conversationId, 
                  otherUserId: user._id,
                  otherUserName: user.name,
                  wa_id: user.wa_id,
                  avatar: user.avatar
                })}
              >
                <Avatar src={user.avatar || ''} />
                <div style={{ marginLeft: "1rem" }}>
                  <div style={{ fontWeight: "bold" }}>{user.name}</div>
                  <div style={{ color: "#888" }}>{user.wa_id}</div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <SidebarChat setActiveChat={setActiveChat} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
