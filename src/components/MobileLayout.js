import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import backIcon from '../assets/go-back.png';
import settingsIcon from '../assets/settings.png';
import '../styles/mobileLayout.scss';
import Searchbar from './Searchbar';
import Sidebar from './Sidebar';

const MobileLayout = ({ winWidth, setOpenBurger }) => {
   const [openSettings, setOpenSettings] = useState(false);

   return (
      <div className='mobile__sidebar-modal'>
         <motion.div
            className='mobile__sidebar'
            initial={{ x: '-100vw' }}
            animate={{ x: 0 }}
            exit={{ x: '-100vw' }}
            transition={{ duration: 0.5 }}
         >
            {winWidth < 1280 && winWidth > 840 && <Searchbar />}
            {winWidth < 840 && (
               <>
                  <div className='mobile__chats'>
                     <Searchbar setOpenBurger={setOpenBurger} />
                  </div>
                  <motion.div
                     className='settings__button'
                     whileTap={{ scale: 0.8 }}
                     onClick={() => {
                        setOpenSettings(!openSettings);
                     }}
                  >
                     <img src={settingsIcon} alt='' />
                  </motion.div>
                  <AnimatePresence>
                     {openSettings && (
                        <motion.div
                           className='mobile__settings'
                           initial={{ x: '-100vw' }}
                           animate={{ x: 0 }}
                           exit={{ x: '-100vw' }}
                        >
                           <Sidebar />
                        </motion.div>
                     )}
                  </AnimatePresence>
               </>
            )}
            <motion.div
               className='close__button'
               whileTap={{ scale: 0.8 }}
               onClick={() => {
                  setOpenBurger(false);
                  setOpenSettings(false);
               }}
            >
               <img src={backIcon} alt='' />
            </motion.div>
         </motion.div>
      </div>
   );
};

export default MobileLayout;
