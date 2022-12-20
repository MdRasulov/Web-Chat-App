import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const Message = ({ message, dummy }) => {
   const { currentUser } = useContext(AuthContext);
   const { chat } = useContext(ChatContext);
   const date = new Date(message.date.seconds * 1000).toLocaleString();

   return (
      <div
         ref={dummy}
         className={`message ${
            message.senderId === currentUser.uid && 'owner'
         }`}
      >
         <div className='user-photo'>
            <img
               src={
                  message.senderId === currentUser.uid
                     ? currentUser.photoURL
                     : chat.friendInfo.photoURL
               }
               alt=''
            />
         </div>
         <div className='message-container'>
            <div className='message-info'>
               <span className='message-date'>{date}</span>
            </div>
            <div className='message-content'>
               <p>{message.text}</p>
            </div>
         </div>
      </div>
   );
};

export default Message;
