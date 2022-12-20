import React, { useEffect } from 'react';
import more from '../assets/more.png';
import Message from './Message';
import Input from './Input';
import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { useState } from 'react';
import { useRef } from 'react';

const Chat = () => {
   const { chat } = useContext(ChatContext);
   const { currentUser } = useContext(AuthContext);
   const [messages, setMessages] = useState([]);

   //fetching chat
   useEffect(() => {
      const fetchMessages = () => {
         const combinedId =
            currentUser.uid > chat.friendInfo.uid
               ? currentUser.uid + chat.friendInfo.uid
               : chat.friendInfo.uid + currentUser.uid;

         const unsub = onSnapshot(
            doc(db, 'users', currentUser.uid, 'chats', combinedId),
            doc => {
               setMessages(doc.data().messages);
            }
         );

         return () => {
            unsub();
         };
      };

      chat && fetchMessages();
   }, [chat]);

   //scrolling to last message
   const dummy = useRef();
   useEffect(() => {
      dummy.current?.scrollIntoView({ behavior: 'smooth' });
   }, [messages]);

   return (
      <>
         {chat && (
            <div className='chat'>
               <div className='chat_info'>
                  <div className='user_photo'>
                     <img src={chat.friendInfo.photoURL} alt='' />
                  </div>
                  <div className='user_info'>
                     <p className='user_name'>{chat.friendInfo.name}</p>
                  </div>
                  <div className='action_icons'>
                     <img src={more} alt='' />
                  </div>
               </div>
               <div className='chat_messages'>
                  {messages &&
                     messages.map(message => (
                        <Message
                           message={message}
                           key={message.id}
                           dummy={dummy}
                        />
                     ))}
               </div>
               <div className='chat_input'>
                  <Input />
               </div>
            </div>
         )}
      </>
   );
};

export default Chat;
