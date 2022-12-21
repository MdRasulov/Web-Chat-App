import React from 'react';
import '../styles/pages/register.scss';
import { auth, db, storage } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import Add from '../assets/add.png';
import { useState } from 'react';
import LoadingType1 from '../loadingAnimations/loadingType1/LoadingType1';

function Register() {
   const navigate = useNavigate();
   const [registerLoading, setRegisterLoading] = useState(false);

   const registerUser = async e => {
      e.preventDefault();
      setRegisterLoading(true);
      const displayName = e.target[0].value;
      const email = e.target[1].value;
      const password = e.target[2].value;
      const avatar = e.target[3].files[0];

      try {
         //create user
         const res = await createUserWithEmailAndPassword(auth, email, password);

         //unique name for user avatar
         const storageRef = ref(storage, `profilePhotos/${res.user.uid}`);

         //upload avater to storage
         uploadBytesResumable(storageRef, avatar).then(() => {
            getDownloadURL(storageRef).then(async downloadURL => {
               //update user auth profile
               await updateProfile(res.user, {
                  displayName,
                  photoURL: downloadURL,
               });

               //add user to database
               await setDoc(doc(db, 'users', res.user.uid), {
                  userInfo: {
                     uid: res.user.uid,
                     displayName,
                     email,
                     photoURL: downloadURL,
                  },
               });
               setRegisterLoading(false);
               navigate('/');
            });
         });
      } catch (error) {
         setRegisterLoading(false);
         const errorCode = error.code;
         const errorMessage = error.message;
         console.log(`code:${errorCode}, message:${errorMessage}`);
      }
   };

   return (
      <div className='wrapper'>
         <div className='container'>
            <div className='form-container'>
               <span className='logo'>Web Chat</span>
               <span className='title'>Registration</span>
               <form onSubmit={e => registerUser(e)}>
                  <input type='text' placeholder='Username' required />
                  <input type='mail' placeholder='mail' required />
                  <input type='password' placeholder='password' required />
                  <input type='file' id='file' style={{ display: 'none' }} />
                  <label htmlFor='file'>
                     <img src={Add} alt='' />
                     <p>chose your avatar</p>
                  </label>
                  <button type='submit'>Sign Up</button>
               </form>
            </div>
            <div className='greeting'>
               <h1>Hello, Friend!</h1>
               <p>Fill the form to start chatting</p>
               <div className='sign-in_link'>
                  Already have an account?
                  <Link to={'/login'}>Sing In</Link>
               </div>
            </div>
         </div>
         {registerLoading && (
            <div className='loading_modal'>
               <LoadingType1 />
            </div>
         )}
      </div>
   );
}

export default Register;
