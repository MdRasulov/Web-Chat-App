import { arrayRemove, doc, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import React, { useContext } from 'react';
import { useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { db, storage } from '../firebase';

const Message = ({ message, dummy }) => {
   const [messageDeleteModal, setMessageDeleteModal] = useState(false);
   const { currentUser } = useContext(AuthContext);
   const { chat, getCombinedId } = useContext(ChatContext);
   const date = new Date(message.date.seconds * 1000).toLocaleString();

   //deletes message
   const deleteMessage = message => {
      const combinedId = getCombinedId(chat.uid);

      const textMessage = {
         date: message.date,
         messageId: message.messageId,
         senderId: message.senderId,
         text: message.text,
      };
      const imageMessage = {
         date: message.date,
         messageId: message.messageId,
         senderId: message.senderId,
         imageURL: message.imageURL,
      };

      //delete message with text content
      if (message.text) {
         updateDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId), {
            messages: arrayRemove(textMessage),
         });

         updateDoc(doc(db, 'users', chat.uid, 'chats', combinedId), {
            messages: arrayRemove(textMessage),
         });
      }

      //delete message with image content
      if (message.imageURL) {
         const storageRef = ref(
            storage,
            `chatGallery/${combinedId}/${message.messageId}`
         );

         updateDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId), {
            messages: arrayRemove(imageMessage),
         });

         updateDoc(doc(db, 'users', chat.uid, 'chats', combinedId), {
            messages: arrayRemove(imageMessage),
         });

         deleteObject(storageRef);
      }
   };

   return (
      <div
         ref={dummy}
         className={`message ${message.senderId === currentUser.uid && 'owner'}`}
      >
         <div className='user-photo'>
            <img
               src={
                  message.senderId === currentUser.uid
                     ? currentUser.photoURL
                     : chat.photoURL
               }
               alt=''
            />
         </div>
         <div
            className='message-container'
            onClick={() => {
               setMessageDeleteModal(!messageDeleteModal);
            }}
         >
            <div className='message-info'>
               <span className='message-date'>{date}</span>
            </div>
            <div className='message-content'>
               {message.text && <p>{message.text}</p>}
               {message.imageURL && <img src={message.imageURL} alt=''></img>}
               {messageDeleteModal && (
                  <div className='message-delete_container'>
                     <div
                        className='message-delete_icon'
                        onClick={() => {
                           deleteMessage(message);
                        }}
                     >
                        <img src={require('../assets/delete.png')} alt='' />
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default Message;
