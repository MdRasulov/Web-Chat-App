import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import React, { useContext } from 'react';
import logout from '../assets/logout.png';
import settings from '../assets/settings.png';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { auth } from '../firebase';

const Sidebar = () => {
   const { currentUser } = useContext(AuthContext);
   const { setChat, unsubRef, setModal, setSettingState } = useContext(ChatContext);

   const logoutUser = () => {
      unsubRef.current();
      setChat();
      signOut(auth);
   };

   return (
      <div className='sidebar'>
         {currentUser && (
            <div className='user_info'>
               <img src={currentUser.photoURL} alt='' />
               <p className='user_name'>{currentUser.displayName}</p>
               <p className='user_mail'>{currentUser.email}</p>
            </div>
         )}

         <div className='settings'>
            <motion.div
               transition={{ duration: 0.2 }}
               whileTap={{ scale: 0.8 }}
               whileHover={{ scale: 1.1 }}
               className='settings_container'
               onClick={() => {
                  setModal(true);
                  setSettingState(true);
               }}
            >
               <img src={settings} alt='' />
               <p>Settings</p>
            </motion.div>
         </div>
         <div className='logout'>
            <motion.div
               whileTap={{ scale: 0.8 }}
               whileHover={{ scale: 1.1 }}
               className='logout_container'
               onClick={logoutUser}
            >
               <img src={logout} alt='' />
               <p>Logout</p>
            </motion.div>
         </div>
      </div>
   );
};

export default Sidebar;
