import {
   collection,
   doc,
   getDocs,
   onSnapshot,
   orderBy,
   query,
} from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import { db } from '../firebase';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
   const { currentUser } = useContext(AuthContext);
   const [chat, setChat] = useState();
   const [chatList, setChatList] = useState();

   useEffect(() => {
      const fetchUsers = () => {
         const q = query(collection(db, 'users', currentUser.uid, 'chats'));
         const unsub = onSnapshot(q, snapshot => {
            let chats = [];
            snapshot.docs.forEach(doc => {
               chats.push({ ...doc.data() });
            });
            setChatList(chats);
         });

         return () => {
            unsub();
         };
      };

      currentUser && fetchUsers();
   }, [currentUser]);

   return (
      <ChatContext.Provider value={{ chat, setChat, chatList }}>
         {children}
      </ChatContext.Provider>
   );
};
