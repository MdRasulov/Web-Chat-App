import { onAuthStateChanged } from 'firebase/auth';
import { createContext, useEffect } from 'react';
import { useState } from 'react';
import { auth } from '../firebase';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
   const [currentUser, setCurrentUser] = useState();

   //auth current user
   useEffect(() => {
      const unsub = onAuthStateChanged(auth, user => {
         setCurrentUser(user);
      });

      return () => {
         unsub();
      };
   }, []);

   return (
      <AuthContext.Provider value={{ currentUser }}>
         {children}
      </AuthContext.Provider>
   );
};
