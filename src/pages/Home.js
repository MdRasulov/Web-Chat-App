import React from 'react';
import Chat from '../components/Chat';
import Searchbar from '../components/Searchbar';
import Sidebar from '../components/Sidebar';
import '../styles/pages/home.scss';

function Home() {
   return (
      <div className='home'>
         <Searchbar />
         <Chat />
         <Sidebar />
      </div>
   );
}

export default Home;
