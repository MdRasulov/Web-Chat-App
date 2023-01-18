import React, { useState } from 'react';
import '../styles/mobileLayout.scss';
import Searchbar from './Searchbar';
import Sidebar from './Sidebar';
import settingsIcon from '../assets/settings.png';
import backIcon from '../assets/go-back.png';

const MobileLayout = ({ winWidth, setOpenBurger }) => {
   const [openSettings, setOpenSettings] = useState(false);

   return (
      <div className='mobile__sidebar-modal'>
         <div className='mobile__sidebar'>
            {winWidth < 1280 && winWidth > 840 && <Searchbar />}
            {winWidth < 840 && (
               <>
                  <div className='mobile__chats'>
                     <Searchbar />
                  </div>
                  <div
                     className='settings__button'
                     onClick={() => {
                        setOpenSettings(!openSettings);
                     }}
                  >
                     <img src={settingsIcon} alt='' />
                  </div>
                  {openSettings && (
                     <div className='mobile__settings'>
                        <Sidebar />
                     </div>
                  )}
               </>
            )}
            <div
               className='close__button'
               onClick={() => {
                  setOpenBurger(false);
                  setOpenSettings(false);
               }}
            >
               <img src={backIcon} alt='' />
            </div>
         </div>
      </div>
   );
};

export default MobileLayout;
