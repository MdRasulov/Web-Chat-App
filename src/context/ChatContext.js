import { collection, onSnapshot, query } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { createContext } from 'react';
import { db } from '../firebase';
import { AuthContext } from './AuthContext';

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
   const { currentUser } = useContext(AuthContext);
   const [chat, setChat] = useState();
   const [chatLoading, setChatLoading] = useState(true);
   const [chatListLoading, setChatListLoading] = useState(true);
   const [chatList, setChatList] = useState();

   //fetching all chats of user
   useEffect(() => {
      setChatLoading(true);
      setChatListLoading(true);
      const fetchUsers = () => {
         const qRef = collection(db, 'users', currentUser.uid, 'chats');
         const unsub = onSnapshot(qRef, snapshot => {
            let chats = [];
            snapshot.docs.forEach(doc => {
               chats.push({ ...doc.data() });
            });
            console.log(`current user: ${currentUser.displayName}`);
            setChatList(chats);
            setChatListLoading(false);
         });

         return () => {
            unsub();
         };
      };

      currentUser && fetchUsers();
   }, [currentUser]);

   return (
      <ChatContext.Provider
         value={{
            chat,
            setChat,
            chatList,
            chatLoading,
            setChatLoading,
            chatListLoading,
         }}
      >
         {children}
      </ChatContext.Provider>
   );
};
