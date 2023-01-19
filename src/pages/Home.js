import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react';
import forwardIcon from '../assets/forward.png';
import Chat from '../components/Chat';
import MobileLayout from '../components/MobileLayout';
import Searchbar from '../components/Searchbar';
import Sidebar from '../components/Sidebar';
import { ChatContext } from '../context/ChatContext';
import '../styles/pages/home.scss';

function Home() {
   const { SetActionsModal } = useContext(ChatContext);
   const [openBurger, setOpenBurger] = useState(false);
   const [winSize, setWinSize] = useState(getWindowSize);

   //monitoring window size
   useEffect(() => {
      function handleWindowResize() {
         setWinSize(getWindowSize());
      }

      window.addEventListener('resize', handleWindowResize);

      return () => {
         window.removeEventListener('resize', handleWindowResize);
      };
   }, []);

   function getWindowSize() {
      const { innerWidth } = window;
      return { innerWidth };
   }
   // ---------------------------------------

   return (
      <motion.div
         initial={{ opacity: 0, x: '100vw' }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.45 }}
         className='home'
      >
         {winSize.innerWidth >= 1280 && (
            <>
               <Searchbar setOpenBurger={setOpenBurger} />
               <Chat />
               <Sidebar />
            </>
         )}
         {winSize.innerWidth < 1280 && (
            <>
               <div
                  className='burger__menu'
                  onClick={() => {
                     setOpenBurger(true);
                     SetActionsModal(false);
                  }}
               >
                  <motion.div className='burger_button' whileTap={{ scale: 0.8 }}>
                     <img src={forwardIcon} alt='' />
                  </motion.div>
               </div>
               <Chat />
               {winSize.innerWidth > 840 && <Sidebar />}
               <AnimatePresence>
                  {openBurger && (
                     <MobileLayout
                        setOpenBurger={setOpenBurger}
                        winWidth={winSize.innerWidth}
                     />
                  )}
               </AnimatePresence>
            </>
         )}
      </motion.div>
   );
}

export default Home;
