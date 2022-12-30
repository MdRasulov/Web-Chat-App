import { deleteDoc, doc } from 'firebase/firestore';
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { db } from '../firebase';
import '../styles/modal.scss';

function Modal({ deleteState, setDeleteState, galleryState, setGalleryState }) {
   const { chat, setModal, getCombinedId, setChat } = useContext(ChatContext);
   const { currentUser } = useContext(AuthContext);

   const combinedId = getCombinedId(chat.friendInfo.uid);
   const deleteChat = async () => {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId));
      await deleteDoc(doc(db, 'users', chat.friendInfo.uid, 'chats', combinedId));
      setChat();
      setModal(false);
      setDeleteState(false);
   };
   return (
      <div className='modal_container'>
         {deleteState && (
            <div className='delete-chat_container'>
               <p>Delete chat with this user?</p>
               <div className='buttons'>
                  <button
                     className='yes'
                     onClick={() => {
                        deleteChat();
                     }}
                  >
                     Yes
                  </button>
                  <button
                     onClick={() => {
                        setModal(false);
                        setDeleteState(false);
                     }}
                  >
                     No
                  </button>
               </div>
            </div>
         )}
      </div>
   );
}

export default Modal;
