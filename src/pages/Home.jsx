import { useState } from 'react';
import Chat from '../components/Chat';
import Sidebar from '../components/Sidebar';
import './Home.css';

const Home = () => {
  const [activeChat, setActiveChat] = useState(null); 

  return (
    <div className='home'>
      <div className="home_container">
        
        <Sidebar setActiveChat={setActiveChat} />
        
        {activeChat ? (
          <Chat activeChat={activeChat} />
        ) : (
          <div className="no_chat_selected">
           
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
