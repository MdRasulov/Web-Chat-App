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
   const [err, setErr] = useState();

   const registerUser = async e => {
      e.preventDefault();
      setRegisterLoading(true);
      const displayName = e.target[0].value;
      const email = e.target[1].value;
      const password = e.target[2].value;
      const repeatpass = e.target[3].value;
      const avatar = e.target[4].files[0];

      try {
         if (password !== repeatpass) {
            const err = new Error('pass dont match');
            err.code = 'passDontMatch';
            throw err;
         }

         //create user
         const res = await createUserWithEmailAndPassword(auth, email, password);

         let avatarURL;
         if (avatar) {
            //path where to upload avatar
            const storageRef = ref(storage, `profilePhotos/${res.user.uid}`);

            //upload avater to storage and get its URL
            await uploadBytesResumable(storageRef, avatar).then(async () => {
               await getDownloadURL(storageRef).then(downloadURL => {
                  avatarURL = downloadURL;
               });
            });
         } else {
            //getting default image for avatar
            await getDownloadURL(
               ref(storage, 'profilePhotos/Default/userDefault.png')
            ).then(downloadURL => {
               avatarURL = downloadURL;
            });
         }

         await updateProfile(res.user, {
            displayName,
            photoURL: avatarURL,
         });

         await setDoc(doc(db, 'users', res.user.uid), {
            userInfo: {
               uid: res.user.uid,
               displayName,
               email,
               photoURL: avatarURL,
            },
         });

         setRegisterLoading(false);
         setErr();
         navigate('/');
      } catch (error) {
         setRegisterLoading(false);
         setErr(error.code);
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
                  <input type='password' placeholder='repaet password' required />
                  <input
                     type='file'
                     id='file'
                     style={{ display: 'none' }}
                     accept='image/*'
                  />
                  <label htmlFor='file'>
                     <img src={Add} alt='' />
                     <p>chose your avatar</p>
                  </label>
                  <button type='submit'>Sign Up</button>
               </form>
               <div className='error_message'>
                  {err === 'auth/email-already-in-use' && (
                     <p>This email is already used</p>
                  )}
                  {err === 'auth/weak-password' && (
                     <p>Password should be at least 6 characters</p>
                  )}
                  {err === 'auth/invalid-email' && <p>Invalid email</p>}
                  {err === 'passDontMatch' && (
                     <p>Password fields don't to match each other</p>
                  )}
               </div>
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
