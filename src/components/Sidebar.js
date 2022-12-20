import React from 'react';
import logout from '../assets/logout.png';
import settings from '../assets/settings.png';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';

const Sidebar = () => {
   const { currentUser } = useContext(AuthContext);
   const { setChat } = useContext(ChatContext);

   const logoutUser = () => {
      setChat();
      signOut(auth);
   };

   return (
      <div className='sidebar'>
         {currentUser.photoURL && (
            <div className='user_info'>
               <img src={currentUser.photoURL} alt='' />
               <p className='user_name'>{currentUser.displayName}</p>
               <p className='user_mail'>{currentUser.email}</p>
            </div>
         )}

         <div className='settings'>
            <div className='settings_container'>
               <img src={settings} alt='' />
               <p>Settings</p>
            </div>
         </div>
         <div className='logout'>
            <div className='logout_container' onClick={logoutUser}>
               <img src={logout} alt='' />
               <p>Logout</p>
            </div>
         </div>
      </div>
   );
};

export default Sidebar;
