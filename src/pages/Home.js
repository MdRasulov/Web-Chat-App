import React from 'react';
import Chat from '../components/Chat';
import Searchbar from '../components/Searchbar';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import '../styles/pages/home.scss';

function Home() {
   return (
      <motion.div
         initial={{ opacity: 0, x: '100vw' }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ duration: 0.45 }}
         className='home'
      >
         <Searchbar />
         <Chat />
         <Sidebar />
      </motion.div>
   );
}

export default Home;
