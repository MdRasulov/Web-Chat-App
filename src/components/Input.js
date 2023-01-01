import React, { useContext, useState } from 'react';
import { arrayUnion, doc, Timestamp, updateDoc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { v4 as uuid } from 'uuid';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

function Input() {
   const { currentUser } = useContext(AuthContext);
   const { chat, getCombinedId } = useContext(ChatContext);
   const [image, setImage] = useState();

   const handleInput = async e => {
      e.preventDefault();
      const combinedId = getCombinedId(chat.friendInfo.uid);

      //sends text message
      if (e.target[0].value) {
         const text = e.target[0].value;
         e.target[0].value = '';
         const messageId = uuid();

         //set a new message
         updateDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId), {
            'friendInfo.lastMessage': text,
            'friendInfo.lastContactAt': Timestamp.now(),
            messages: arrayUnion({
               text,
               senderId: currentUser.uid,
               date: Timestamp.now(),
               messageId,
            }),
         });
         updateDoc(doc(db, 'users', chat.friendInfo.uid, 'chats', combinedId), {
            'friendInfo.lastMessage': text,
            'friendInfo.lastContactAt': Timestamp.now(),
            messages: arrayUnion({
               text,
               senderId: currentUser.uid,
               date: Timestamp.now(),
               messageId,
            }),
         });
      }

      //send image
      if (image) {
         const imageId = uuid();

         //path where to upload image
         const storageRef = ref(storage, `chatGallery/${combinedId}/${imageId}`);

         //upload image to storage and get its URL
         await uploadBytesResumable(storageRef, image).then(async () => {
            await getDownloadURL(storageRef).then(downloadURL => {
               //set a new message
               updateDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId), {
                  'friendInfo.lastContactAt': Timestamp.now(),
                  'friendInfo.lastMessage': 'image',
                  messages: arrayUnion({
                     imageURL: downloadURL,
                     senderId: currentUser.uid,
                     date: Timestamp.now(),
                     messageId: imageId,
                  }),
               });
               updateDoc(doc(db, 'users', chat.friendInfo.uid, 'chats', combinedId), {
                  'friendInfo.lastContactAt': Timestamp.now(),
                  'friendInfo.lastMessage': 'image',
                  messages: arrayUnion({
                     imageURL: downloadURL,
                     senderId: currentUser.uid,
                     date: Timestamp.now(),
                     messageId: imageId,
                  }),
               });
            });
         });
         setImage();
      }
   };

   return (
      <div className='input-content'>
         <form
            onSubmit={e => {
               if (e.target && chat) {
                  handleInput(e);
               } else {
                  e.preventDefault();
               }
            }}
         >
            <input type='text' placeholder='Add a message...' />
            <button type='submit'>
               <img src={require('../assets/send.png')} alt='' />
            </button>
            <input
               type='file'
               id='file'
               style={{ display: 'none' }}
               accept='image/*'
               onChange={e => {
                  setImage(e.target.files[0]);
               }}
            />
            <div className='additional-actions'>
               <label htmlFor='file'>
                  {image ? (
                     <img src={require('../assets/image_selected.png')} alt='' />
                  ) : (
                     <img src={require('../assets/image.png')} alt='' />
                  )}
               </label>
            </div>
         </form>
      </div>
   );
}

export default Input;
