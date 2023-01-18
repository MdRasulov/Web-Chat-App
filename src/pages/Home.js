import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import Chat from '../components/Chat';
import MobileLayout from '../components/MobileLayout';
import Searchbar from '../components/Searchbar';
import Sidebar from '../components/Sidebar';
import '../styles/pages/home.scss';
import forwardIcon from '../assets/forward.png';

function Home() {
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
               <Searchbar />
               <Chat />
               <Sidebar />
            </>
         )}
         {winSize.innerWidth < 1280 && (
            <>
               <div
                  onClick={() => {
                     setOpenBurger(true);
                  }}
                  className='burger__menu'
               >
                  <div className='burger_button'>
                     <img src={forwardIcon} alt='' />
                  </div>
               </div>
               <Chat />
               {winSize.innerWidth > 840 && <Sidebar />}
               {openBurger && (
                  <MobileLayout
                     setOpenBurger={setOpenBurger}
                     winWidth={winSize.innerWidth}
                  />
               )}
            </>
         )}
      </motion.div>
   );
}

export default Home;
