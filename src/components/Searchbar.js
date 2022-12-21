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
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { db } from '../firebase';

const Search = () => {
   const { currentUser } = useContext(AuthContext);
   const { setChat, chatList, setChatLoading, chatListLoading } = useContext(ChatContext);
   const [users, setUsers] = useState();
   const [selectedUser, setSelectedUser] = useState();
   const [dispalySearch, setDisplaySearch] = useState(false);
   const [searchErr, setSearchErr] = useState(false);

   // search users from db
   const searchUsers = async e => {
      e.preventDefault();
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
      const combinedId =
         currentUser.uid > selectedUser.uid
            ? currentUser.uid + selectedUser.uid
            : selectedUser.uid + currentUser.uid;

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
               setChat(doc.data());
               setChatLoading(false);
               lastConversation(doc.data());
            }
         );
      } else {
         await getDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId)).then(
            doc => {
               setChat(doc.data());
               setChatLoading(false);
               lastConversation(doc.data());
            }
         );
      }
      setSelectedUser();
   };

   //updates last converversation for fetching lastest chat
   const lastConversation = partner => {
      const combinedId =
         currentUser.uid > partner.friendInfo.uid
            ? currentUser.uid + partner.friendInfo.uid
            : partner.friendInfo.uid + currentUser.uid;

      //updating last conversation partner for current user
      updateDoc(doc(db, 'users', currentUser.uid), {
         'userInfo.lastConversationWith': combinedId,
      });
   };

   //fetch latest chat
   useEffect(() => {
      const fetchLastConversation = async () => {
         let combinedId;
         await getDoc(doc(db, 'users', currentUser.uid)).then(doc => {
            combinedId = doc.data().userInfo.lastConversationWith;
         });
         await getDoc(doc(db, 'users', currentUser.uid, 'chats', combinedId)).then(
            doc => {
               if (doc.exists()) {
                  setChat(doc.data());
                  setChatLoading(false);
               } else {
                  setChatLoading(true);
               }
            }
         );
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
            {dispalySearch && (
               <div className='searching_container'>
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
                  {}
               </div>
            )}

            <div className='chatList_container'>
               {chatListLoading && <h3>Loading ....</h3>}
               {!chatListLoading &&
                  chatList &&
                  chatList
                     .sort(
                        (a, b) =>
                           b.friendInfo.lastContactAt.seconds -
                           a.friendInfo.lastContactAt.seconds
                     )
                     .map(user => (
                        <div
                           className='user'
                           key={user.friendInfo.uid}
                           onClick={() => {
                              setSelectedUser();
                              setChat(user);
                              lastConversation(user);
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
                                    : ''}
                              </p>
                           </div>
                        </div>
                     ))}
            </div>
         </div>
      </div>
   );
};

export default Search;
