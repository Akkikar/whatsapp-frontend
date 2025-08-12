import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField
} from "@mui/material";
import axios from "axios";

const CreateContactDialog = ({ open, handleClose }) => {
  const [name, setName] = useState("");
  const [waId, setWaId] = useState("");

  const handleCreateContact = async () => {
    try {
     
      const contactRes = await axios.post("https://whatsapp-backend-6aup.onrender.com/api/auth/login", {
        name,
        wa_id: waId
      });

      const otherUser = contactRes.data; 

     
      sessionStorage.setItem("otherUser", JSON.stringify(otherUser));

      
      const user = JSON.parse(sessionStorage.getItem("user"));
      const senderId = user?._id;
      const receiverId = otherUser._id;

      await axios.post("https://whatsapp-backend-6aup.onrender.com/api/conversations", {
        senderId,
        receiverId
      });

      handleClose();
    } catch (error) {
      console.error("Error creating contact:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create New Contact</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          margin="dense"
          label="WhatsApp ID"
          value={waId}
          onChange={(e) => setWaId(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        <Button onClick={handleCreateContact} variant="contained" color="primary">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateContactDialog;
