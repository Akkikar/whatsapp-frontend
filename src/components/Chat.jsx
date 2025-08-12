import React, { useEffect, useState, useRef } from 'react';
import './Chat.css';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import EmojiPicker from "emoji-picker-react";
import MicIcon from '@mui/icons-material/Mic';
import axios from 'axios';
import { io } from 'socket.io-client';


const socket = io("ws://localhost:9000", { autoConnect: false });

const Chat = ({ activeChat }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef(null);
  const chatBodyRef = useRef(null);

  const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
  const userId = loggedInUser?._id;

  
  useEffect(() => {
    if (userId) {
      socket.connect();
      socket.emit("addUser", userId);
    }
    return () => {
      socket.disconnect();
    }
  }, [userId]);


  useEffect(() => {
    if (activeChat?.conversationId) {
      axios
        .get(`http://localhost:9000/api/messages/${activeChat.conversationId}`)
        .then((res) => {
          setMessages(res.data);
        })
        .catch((err) => console.error(err));
    }
  }, [activeChat]);

  
  useEffect(() => {
   
    const handleGetMessage = (data) => {
      
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });
      
      setTimeout(() => {
        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
      }, 100);
    };

   
    const handleMessageStatusUpdate = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    };

    socket.on("getMessage", handleGetMessage);
    socket.on("messageStatusUpdate", handleMessageStatusUpdate);

    
    return () => {
      socket.off("getMessage", handleGetMessage);
      socket.off("messageStatusUpdate", handleMessageStatusUpdate);
    };
  }, []);


  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [activeChat]);

  
  useEffect(() => {
    if (activeChat?.conversationId) {
      messages.forEach((msg) => {
        if (msg.sender !== userId && msg.status !== "read") {
          socket.emit("readMessage", { messageId: msg._id, senderId: msg.sender });
        }
      });
    }
  }, [messages, activeChat, userId]);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

   
    const newMessage = {
      _id: Date.now().toString(),
      conversationId: activeChat.conversationId,
      sender: userId,
      text: input,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    socket.emit("sendMessage", {
      senderId: userId,
      receiverId: activeChat.otherUserId,
      conversationId: activeChat.conversationId,
      text: input,
      status: 'sent'
    });

    setInput('');

    
    setTimeout(() => {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    }, 100);
  };

  const onEmojiClick = (emojiData, event) => {
    setInput((prev) => prev + emojiData.emoji);
  };

  return (
    <div className='chat'>
      <div className="chat_header">
        <Avatar src={activeChat?.avatar || ''} />
        <div className="chat_headerInfo">
          <h3>{activeChat?.otherUserName}</h3>
          <p>{activeChat?.wa_id}</p>
        </div>
        <div className="chat_headerRight">
          <IconButton><SearchOutlinedIcon /></IconButton>
          <IconButton><AttachFileIcon /></IconButton>
          <IconButton><MoreVertIcon /></IconButton>
        </div>
      </div>

      <div className="chat_body" ref={chatBodyRef}>
        {messages.map((msg) => (
          <p
            key={msg._id}
            className={`chat_message ${msg.sender === userId ? 'chat_receiver' : ''}`}
          >
            <span className="chat_name">
              {msg.sender === userId ? 'You' : activeChat?.otherUserName}
            </span>
            {msg.text}
            {msg.sender === userId && (
              <span className="chat_status"> {msg.status?.charAt(0).toUpperCase()} </span>
            )}
            <span className="chat_timestamp">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        ))}
      </div>

      <div className="chat_footer">
        <div style={{ position: "relative" }}>
          <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
            <InsertEmoticonIcon />
          </IconButton>
          {showEmojiPicker && (
            <div ref={pickerRef} style={{ position: "absolute", bottom: "50px", zIndex: 100 }}>
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
        </div>
        <form onSubmit={sendMessage}>
          <input
            type="text"
            placeholder='Type a message'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type='submit'>Send</button>
        </form>
        <IconButton><MicIcon /></IconButton>
      </div>
    </div>
  );
};

export default Chat;