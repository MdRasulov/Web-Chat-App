import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import LoadingType1 from '../loadingAnimations/loadingType1/LoadingType1';
import '../styles/pages/register.scss';

function Register() {
   const navigate = useNavigate();
   const [registerLoading, setRegisterLoading] = useState(false);
   const [err, setErr] = useState();
   const [avatar, setAvatar] = useState();

   const registerUser = async e => {
      e.preventDefault();
      setRegisterLoading(true);
      const displayName = e.target[0].value;
      const email = e.target[1].value;
      const password = e.target[2].value;
      const repeatpass = e.target[3].value;

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
            setAvatar();
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
                  <input type='text' placeholder='Username' required maxLength={20} />
                  <input type='mail' placeholder='mail' required />
                  <input type='password' placeholder='password' required />
                  <input type='password' placeholder='repeat password' required />
                  <input
                     type='file'
                     id='file'
                     style={{ display: 'none' }}
                     accept='image/*'
                     onChange={e => {
                        setAvatar(e.target.files[0]);
                     }}
                  />
                  <motion.label whileTap={{ scale: 0.9 }} htmlFor='file'>
                     {avatar ? (
                        <>
                           <img src={require('../assets/image_selected.png')} alt='' />
                           <p className='selected'>image selected</p>
                        </>
                     ) : (
                        <>
                           <img src={require('../assets/image_add.png')} alt='' />
                           <p>chose your profile image</p>
                        </>
                     )}
                  </motion.label>
                  <motion.button
                     whileHover={{ backgroundColor: '#73afe7', color: '#ffff' }}
                     whileTap={{ scale: 0.9 }}
                     type='submit'
                  >
                     Sign Up
                  </motion.button>
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
                     <p>Password fields should match to each other</p>
                  )}
               </div>
            </div>
            <div className='greeting'>
               <h1>Hello, Friend!</h1>
               <p>Fill the form to start chatting</p>
               <div className='sign-in_link'>
                  Already have an account?
                  <motion.div whileHover={{ scale: 1.1 }} className='link'>
                     <Link to={'/login'}>Sing In</Link>
                  </motion.div>
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
