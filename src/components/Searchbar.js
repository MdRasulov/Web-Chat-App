import {
   collection,
   doc,
   getDoc,
   getDocs,
   query,
   setDoc,
   Timestamp,
   updateDoc,
   where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { db } from '../firebase';
import LoadingType2 from '../loadingAnimations/loadingType2/LoadingType2';

const Search = () => {
   const { currentUser } = useContext(AuthContext);
   const { setChat, chatList, setChatLoading, chatListLoading, getCombinedId } =
      useContext(ChatContext);
   const [users, setUsers] = useState();
   const [selectedUser, setSelectedUser] = useState();
   const [dispalySearch, setDisplaySearch] = useState(false);
   const [searchErr, setSearchErr] = useState(false);

   // search users from db
   const searchUsers = async e => {
      e.preventDefault();

      //cleaning previous value
      setUsers([]);

      const q = query(
         collection(db, 'users'),
         where('userInfo.displayName', '==', e.target[0].value)
      );
      e.target[0].value = '';

      const querySnapshot = await getDocs(q);
      let foundUsers = [];
      if (!querySnapshot.empty) {
         querySnapshot.forEach(doc => {
            foundUsers.push({ ...doc.data() });
         });
         setUsers(foundUsers);
         setSearchErr(false);
      } else {
         setUsers();
         setSearchErr(true);
      }
   };

   // calls connectUsers func when chat with user is selected
   useEffect(() => {
      if (selectedUser) {
         connectUsers();
      }
   }, [selectedUser]);

   // creates connection between users
   const connectUsers = async () => {
      const combinedId = getCombinedId(selectedUser.uid);

      const response = await getDoc(
         doc(db, 'users', currentUser.uid, 'chats', combinedId)
      );

      //creating chat collection
      if (!response.exists()) {
         await setDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId), {
            friendInfo: {
               name: selectedUser.displayName,
               uid: selectedUser.uid,
               photoURL: selectedUser.photoURL,
               lastContactAt: Timestamp.now(),
            },
         });
         await setDoc(doc(db, 'users', selectedUser.uid, 'chats', combinedId), {
            friendInfo: {
               name: currentUser.displayName,
               uid: currentUser.uid,
               photoURL: currentUser.photoURL,
               lastContactAt: Timestamp.now(),
            },
         });

         // getting chat doc
         await getDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId)).then(
            doc => {
               setChat(doc.data().friendInfo);
               setChatLoading(false);
               lastConversation(doc.data());
            }
         );
      } else {
         await getDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId)).then(
            doc => {
               setChat(doc.data().friendInfo);
               setChatLoading(false);
               lastConversation(doc.data());
            }
         );
      }
      setSelectedUser();
   };

   //updates last converversation for fetching lastest chat
   const lastConversation = partner => {
      const combinedId = getCombinedId(partner.uid);

      //updating last conversation partner for current user
      updateDoc(doc(db, 'users', currentUser.uid), {
         'userInfo.lastConversationWith': combinedId,
      });
   };

   //update friend-info with latest data and set chat with it
   const updateFriendInfo = async uid => {
      const combinedId = getCombinedId(uid);
      const docRef = doc(db, 'users', currentUser.uid, 'chats', combinedId);

      //update friend-info
      await getDoc(doc(db, 'users', uid)).then(async res => {
         const friendInfo = res.data().userInfo;
         await updateDoc(docRef, {
            'friendInfo.photoURL': friendInfo.photoURL,
            'friendInfo.name': friendInfo.displayName,
         });
      });

      //set chat with friend-info
      await getDoc(docRef).then(doc => {
         setChat(doc.data().friendInfo);
      });

      setChatLoading(false);
   };

   //fetch latest chat
   useEffect(() => {
      const fetchLastConversation = async () => {
         let combinedId;
         await getDoc(doc(db, 'users', currentUser.uid)).then(doc => {
            combinedId = doc.data().userInfo.lastConversationWith;
         });
         if (combinedId) {
            await getDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId)).then(
               doc => {
                  if (doc.exists()) {
                     setChat(doc.data().friendInfo);
                     setChatLoading(false);
                  } else {
                     setChat();
                     setChatLoading(false);
                  }
               }
            );
         } else {
            setChatLoading(false);
         }
      };

      currentUser && fetchLastConversation();
   }, [currentUser]);

   return (
      <div className='searchbar'>
         <h1>Chats</h1>
         <form
            className='search'
            onSubmit={e => {
               if (e.target[0].value) {
                  searchUsers(e);
                  setDisplaySearch(true);
               } else {
                  e.preventDefault();
                  setDisplaySearch(false);
               }
            }}
         >
            <input type='text' placeholder='Search...' />
            <button type='submit' style={{ display: 'none' }}></button>
         </form>
         <div className='users_container'>
            <AnimatePresence>
               {dispalySearch && (
                  <motion.div
                     initial={{ opacity: 0, y: -150 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -150 }}
                     className='searching_container'
                  >
                     {!searchErr && users && (
                        <div className='found_users'>
                           <p>Results of the search....</p>
                           {users
                              .filter(user => user.userInfo.uid !== currentUser.uid)
                              .map(user => (
                                 <div
                                    className='found_user'
                                    key={user.userInfo.uid}
                                    onClick={() => {
                                       setChat();
                                       setChatLoading(true);
                                       setSelectedUser(user.userInfo);
                                       setDisplaySearch(false);
                                    }}
                                 >
                                    <div className='user_photo'>
                                       <img src={user.userInfo.photoURL} alt='' />
                                    </div>
                                    <div className='user_info'>
                                       <p className='user_name'>
                                          {user.userInfo.displayName}
                                       </p>
                                    </div>
                                 </div>
                              ))}
                        </div>
                     )}
                     {searchErr && <p>No matches are found</p>}
                  </motion.div>
               )}
            </AnimatePresence>

            <div className='chatList_container'>
               {chatListLoading && (
                  <div className='loading_container'>
                     <LoadingType2 />
                  </div>
               )}
               {!chatListLoading &&
                  chatList &&
                  chatList
                     .sort(
                        (a, b) =>
                           b.friendInfo.lastContactAt.seconds -
                           a.friendInfo.lastContactAt.seconds
                     )
                     .map(user => (
                        <motion.div
                           whileHover={{ backgroundColor: '#606f85' }}
                           className='user'
                           key={user.friendInfo.uid}
                           onClick={() => {
                              setChatLoading(true);
                              updateFriendInfo(user.friendInfo.uid);
                              lastConversation(user.friendInfo);
                           }}
                        >
                           <div className='user_photo'>
                              <img src={user.friendInfo.photoURL} alt='' />
                           </div>
                           <div className='user_info'>
                              <p className='user_name'>{user.friendInfo.name}</p>
                              <p className='user_last-message'>
                                 {user.friendInfo.lastMessage
                                    ? user.friendInfo.lastMessage
                                    : 'No any messages'}
                              </p>
                           </div>
                        </motion.div>
                     ))}
            </div>
         </div>
      </div>
   );
};

export default Search;
