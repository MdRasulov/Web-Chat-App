import { deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, list, ref } from 'firebase/storage';
import { motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { db, storage } from '../firebase';
import LoadingType2 from '../loadingAnimations/loadingType2/LoadingType2';
import '../styles/modal.scss';
import Settings from './Settings';

function Modal({ deleteState, setDeleteState, mediaState, setMediaState }) {
   const { chat, setModal, getCombinedId, setChat, settingState, setSettingState } =
      useContext(ChatContext);
   const { currentUser } = useContext(AuthContext);
   const [imageURLs, setImageURLs] = useState();
   const [loading, setLoading] = useState(false);

   // fetching all images of the chat from cloud storage
   useEffect(() => {
      const fetchMedia = async () => {
         const combinedId = getCombinedId(chat.uid);
         const storageRef = ref(storage, `chatGallery/${combinedId}/`);
         const arr = [];
         setLoading(true);
         try {
            const itemList = await list(storageRef);
            if (itemList.items.length) {
               for (const item of itemList.items) {
                  const url = await getDownloadURL(ref(storage, item.fullPath));
                  arr.push(url);
               }

               setImageURLs(arr);
            } else {
               setImageURLs();
            }

            setLoading(false);
         } catch (error) {
            setLoading(false);
            console.log(error);
         }
      };

      mediaState && fetchMedia();
   }, [mediaState]);

   //funct that deletes the chat and all data connected to chat
   const deleteChat = async () => {
      const combinedId = getCombinedId(chat.uid);
      const storageRef = ref(storage, `chatGallery/${combinedId}/`);
      //delete chat for user and connected friend
      await deleteDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId));
      await deleteDoc(doc(db, 'users', chat.uid, 'chats', combinedId));

      //delete all chat's media files from cloud storage
      await list(storageRef).then(res => {
         res.items.map(item => deleteObject(ref(storage, item.fullPath)));
      });

      setChat();
      setModal(false);
      setDeleteState(false);
   };

   //open image in new tab
   const openInNewTab = url => {
      window.open(url, '_blank', 'noreferrer');
   };

   return (
      <div className='modal_container'>
         {deleteState && (
            <motion.div className='delete-chat_container'>
               <p>Delete chat with this user?</p>
               <div className='buttons'>
                  <motion.button
                     whileTap={{ scale: 0.8 }}
                     className='yes'
                     onClick={() => {
                        deleteChat();
                     }}
                  >
                     Yes
                  </motion.button>
                  <motion.button
                     whileTap={{ scale: 0.8 }}
                     onClick={() => {
                        setDeleteState(false);
                        setModal(false);
                     }}
                  >
                     No
                  </motion.button>
               </div>
            </motion.div>
         )}
         {mediaState && (
            <div className='media_container'>
               <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className='exit'
                  onClick={() => {
                     setImageURLs([]);
                     setMediaState(false);
                     setModal(false);
                  }}
               >
                  <img src={require('../assets/close.png')} alt='' />
               </motion.button>
               <div className='images_container'>
                  {imageURLs &&
                     imageURLs.map(url => (
                        <motion.div
                           whileHover={{ opacity: 0.7 }}
                           className='image'
                           key={url}
                           onClick={() => {
                              openInNewTab(url);
                           }}
                        >
                           <img src={url} alt='' loading='lazy' />
                        </motion.div>
                     ))}
                  {!imageURLs && !loading && (
                     <div className='no_image'>
                        <img src={require('../assets/no_images.png')} alt='' />
                        <p>There is no any shared images in this chat</p>
                     </div>
                  )}
               </div>
            </div>
         )}
         {settingState && (
            <Settings setModal={setModal} setSettingState={setSettingState} />
         )}
         {loading && (
            <div className='loading_container'>
               <LoadingType2 />
            </div>
         )}
      </div>
   );
}

export default Modal;
