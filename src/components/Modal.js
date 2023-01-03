import { deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, list, ref } from 'firebase/storage';
import React, { useContext, useEffect } from 'react';
import { useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { db, storage } from '../firebase';
import '../styles/modal.scss';
import Settings from './Settings';

function Modal({ deleteState, setDeleteState, mediaState, setMediaState }) {
   const { chat, setModal, getCombinedId, setChat, settingState, setSettingState } =
      useContext(ChatContext);
   const { currentUser } = useContext(AuthContext);
   const [imageURLs, setImageURLs] = useState([]);
   const combinedId = getCombinedId(chat.uid);
   const storageRef = ref(storage, `chatGallery/${combinedId}/`);

   //! developing stage
   //fetching all images of the chat from cloud storage
   // useEffect(() => {
   //    const fetchMedia = async () => {
   //       await list(storageRef).then(res => {
   //          res.items.forEach(element => {
   //             getDownloadURL(ref(storage, element.fullPath)).then(url => {
   //                setImageURLs([...imageURLs, url]);
   //             });
   //          });
   //       });
   //    };

   //    mediaState && fetchMedia();
   // }, [mediaState]);

   //funct that deletes the chat and all data connected to chat
   const deleteChat = async () => {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId));
      await deleteDoc(doc(db, 'users', chat.uid, 'chats', combinedId));
      await list(storageRef).then(res => {
         res.items.map(item => deleteObject(ref(storage, item.fullPath)));
      });
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
         {mediaState && (
            <div className='media_container'>
               <button
                  className='exit'
                  onClick={() => {
                     setImageURLs([]);
                     setMediaState(false);
                     setModal(false);
                  }}
               >
                  <img src={require('../assets/close.png')} alt='' />
               </button>
               <div className='images_container'>This option is not avaible yet</div>
            </div>
         )}
         {settingState && (
            <Settings
               setModal={setModal}
               setSettingState={setSettingState}
               combinedId={combinedId}
            />
         )}
      </div>
   );
}

export default Modal;
