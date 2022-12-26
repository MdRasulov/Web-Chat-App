import React, { useContext } from 'react';
import { arrayUnion, doc, Timestamp, updateDoc } from 'firebase/firestore';
import picture from '../assets/picture.png';
import emoji from '../assets/emoji.png';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { v4 as uuid } from 'uuid';

function Input() {
   const { currentUser } = useContext(AuthContext);
   const { chat } = useContext(ChatContext);

   const handleInput = async e => {
      e.preventDefault();

      const text = e.target[0].value;
      e.target[0].value = '';
      const combinedId =
         currentUser.uid > chat.friendInfo.uid
            ? currentUser.uid + chat.friendInfo.uid
            : chat.friendInfo.uid + currentUser.uid;

      updateDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId), {
         'friendInfo.lastMessage': text,
         'friendInfo.lastContactAt': Timestamp.now(),
         messages: arrayUnion({
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            id: uuid(),
         }),
      });
      updateDoc(doc(db, 'users', chat.friendInfo.uid, 'chats', combinedId), {
         'friendInfo.lastMessage': text,
         'friendInfo.lastContactAt': Timestamp.now(),
         messages: arrayUnion({
            text,
            senderId: currentUser.uid,
            date: Timestamp.now(),
            id: uuid(),
         }),
      });
   };

   return (
      <div className='input-content'>
         <form
            onSubmit={e => {
               if (e.target[0].value) {
                  handleInput(e);
               } else {
                  e.preventDefault();
               }
            }}
         >
            <input type='text' placeholder='Add a message...' />
         </form>
         <div className='additional-actions'>
            <img src={emoji} alt='' />
            <img src={picture} alt='' />
         </div>
      </div>
   );
}

export default Input;
