import React, { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import axios from 'axios';
import './SidebarChat.css';

const SidebarChat = ({ setActiveChat }) => {
  const [conversations, setConversations] = useState([]); // array instead of null
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    if (!user) {
      setError('User not logged in');
      return;
    }

    const { _id: userId } = JSON.parse(user);

    const fetchConversation = async () => {
      try {
        const res = await axios.get(`http://localhost:9000/api/conversations/${userId}`);
        setConversations(res.data); // now stores array
      } catch (err) {
        setError('Failed to load conversation');
      }
    };

    fetchConversation();
  }, []);

  if (error) return <p className="error-message">{error}</p>;
  if (!conversations.length) return <p>Loading...</p>;

  return (
    <div className="sidebarChatList">
      {conversations.map((conv) => (
        <div
          key={conv.conversationId}
          className="sidebarChat"
          onClick={() => setActiveChat(conv)}
        >
          <Avatar src={conv.avatar || ''} />
          <div className="sidebarChat_info">
            <h2>{conv.otherUserName}</h2>
            <p>{conv.lastMessage}</p>
            {conv.lastMessage && <span className="time">{conv.lastMessageTime}</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SidebarChat;
