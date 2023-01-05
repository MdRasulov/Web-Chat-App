import {
   EmailAuthProvider,
   reauthenticateWithCredential,
   updateEmail,
   updatePassword,
   updateProfile,
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import {
   deleteObject,
   getDownloadURL,
   ref,
   uploadBytesResumable,
} from 'firebase/storage';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db, storage } from '../firebase';
import LoadingType2 from '../loadingAnimations/loadingType2/LoadingType2';

const Settings = ({ setSettingState, setModal, combinedId }) => {
   const { currentUser } = useContext(AuthContext);
   const [newPhoto, setNewPhoto] = useState();
   const [changeState, setChangeState] = useState(false);
   const [changeName, setChangeName] = useState(false);
   const [changeMail, setChangeMail] = useState(false);
   const [changePass, setChangePass] = useState(false);
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);
   const [err, setErr] = useState();

   const closeEveryModal = () => {
      setSettingState(false);
      setSuccess(false);
      setModal(false);
   };

   const closeEveryState = () => {
      setLoading(false);
      setSuccess(true);

      setTimeout(() => {
         closeEveryModal();
      }, 1300);
   };

   //changes userPhoto
   const changePhoto = async () => {
      try {
         const storageRef = ref(storage, `profilePhotos/${currentUser.uid}`);
         //deleting old profile photo
         await deleteObject(storageRef);

         //submitting new profile photo
         await uploadBytesResumable(storageRef, newPhoto).then(async () => {
            await getDownloadURL(storageRef).then(async downloadURL => {
               //update profile photo
               await updateProfile(currentUser, {
                  photoURL: downloadURL,
               });
               //updating user photo in db
               await updateDoc(doc(db, 'users', currentUser.uid), {
                  'userInfo.photoURL': downloadURL,
               });
            });
            setNewPhoto();
            closeEveryState();
         });
      } catch (error) {
         setErr(error.code);
      }
   };

   //changes username
   const changeUsername = async e => {
      try {
         //updating user photo
         await updateProfile(currentUser, {
            displayName: e.target[0].value,
         });
         //updating user photo in db
         await updateDoc(doc(db, 'users', currentUser.uid), {
            'userInfo.displayName': e.target[0].value,
         });

         closeEveryState();
      } catch (error) {
         setLoading(false);
         setErr(error.code);
      }
   };

   //changes email
   const changeEmail = async e => {
      const credential = EmailAuthProvider.credential(
         currentUser.email,
         e.target[1].value
      );
      try {
         //reauth user
         await reauthenticateWithCredential(currentUser, credential);

         //change users email
         await updateEmail(currentUser, e.target[0].value);

         //change users email in db
         await updateDoc(doc(db, 'users', currentUser.uid), {
            'userInfo.email': e.target[0].value,
         });

         closeEveryState();
      } catch (error) {
         setLoading(false);
         setErr(error.code);
      }
   };

   //changes pass
   const changePassword = async e => {
      const credential = EmailAuthProvider.credential(
         currentUser.email,
         e.target[0].value
      );
      if (e.target[1].value === e.target[2].value) {
         try {
            //reauth user
            await reauthenticateWithCredential(currentUser, credential);

            //change users password
            await updatePassword(currentUser, e.target[1].value);

            closeEveryState();
         } catch (error) {
            setLoading(false);
            setErr(error.code);
         }
      } else {
         setLoading(false);
         setErr('passDontMatch');
      }
   };

   return (
      <div className='setting_container'>
         <motion.button
            whileHover={{ scale: 1.2 }}
            className='exit'
            onClick={() => {
               closeEveryModal();
            }}
         >
            <img src={require('../assets/close.png')} alt='' />
         </motion.button>
         <div className='user'>
            <div className='userPhoto secondary'>
               {newPhoto ? (
                  <img src={URL.createObjectURL(newPhoto)} alt='' />
               ) : (
                  <img src={currentUser.photoURL} alt='' />
               )}
               <div className='change_photo'>
                  <input
                     type='file'
                     id='file'
                     style={{ display: 'none' }}
                     accept='image/*'
                     onChange={e => {
                        setNewPhoto(e.target.files[0]);
                     }}
                  />
                  <motion.label whileTap={{ scale: 0.9 }} htmlFor='file'>
                     {newPhoto ? (
                        <>
                           <p className='selected'>Image selected !</p>
                        </>
                     ) : (
                        <>
                           <motion.p
                              whileHover={{ color: '#73afe7' }}
                              className='not-selected'
                           >
                              Select new image
                           </motion.p>
                        </>
                     )}
                  </motion.label>
                  {newPhoto && (
                     <motion.p
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ color: '#73afe7' }}
                        className='change'
                        onClick={() => {
                           changePhoto();
                           setLoading(true);
                        }}
                     >
                        Click here to change your profile photo
                     </motion.p>
                  )}
               </div>
            </div>
            <div className='userInfo'>
               <div className='userName'>
                  <p>UserName: </p>
                  <span>{currentUser.displayName}</span>
                  <motion.p
                     whileTap={{ scale: 0.9 }}
                     whileHover={{ color: '#73afe7' }}
                     className='change'
                     onClick={() => {
                        setChangeState(true);
                        setChangeName(true);
                     }}
                  >
                     change
                  </motion.p>
               </div>
               <div className='userEmail'>
                  <p>Email: </p>
                  {currentUser.email}
                  <motion.p
                     whileTap={{ scale: 0.9 }}
                     whileHover={{ color: '#73afe7' }}
                     className='change'
                     onClick={() => {
                        setChangeState(true);
                        setChangeMail(true);
                     }}
                  >
                     change
                  </motion.p>
               </div>
               <div className='userPass'>
                  <p>Password: </p> ******....
                  <motion.p
                     whileTap={{ scale: 0.9 }}
                     whileHover={{ color: '#73afe7' }}
                     className='change'
                     onClick={() => {
                        setChangeState(true);
                        setChangePass(true);
                     }}
                  >
                     change
                  </motion.p>
               </div>
            </div>
         </div>
         <AnimatePresence>
            {changeState && (
               <motion.div exit={{ opacity: 0 }} className='change_container'>
                  <button
                     className='back'
                     onClick={() => {
                        setChangeName(false);
                        setChangeMail(false);
                        setChangePass(false);
                        setChangeState(false);
                        setErr();
                     }}
                  >
                     <img src={require('../assets/back.png')} alt='' />
                  </button>
                  {changeName && (
                     <motion.div
                        initial={{ opacity: 0, x: '20vw' }}
                        animate={{ opacity: 1, x: 0 }}
                        className='change_name'
                     >
                        <p>Enter your new Name</p>
                        <form
                           onSubmit={e => {
                              e.preventDefault();
                              if (e.target) {
                                 setLoading(true);
                                 changeUsername(e);
                              }
                           }}
                        >
                           <input
                              type='text'
                              placeholder={currentUser.displayName}
                              required
                           />
                           <motion.button
                              whileHover={{ color: '#ffff', backgroundColor: '#73afe7' }}
                              whileTap={{ scale: 0.9 }}
                              type='submit'
                           >
                              Change
                           </motion.button>
                        </form>
                     </motion.div>
                  )}
                  {changeMail && (
                     <motion.div
                        initial={{ opacity: 0, x: '20vw' }}
                        animate={{ opacity: 1, x: 0 }}
                        className='change_email'
                     >
                        <p>Enter your new Mail</p>
                        <form
                           onSubmit={e => {
                              e.preventDefault();
                              if (e.target) {
                                 setLoading(true);
                                 changeEmail(e);
                              }
                           }}
                        >
                           <input type='mail' placeholder='new mail' required />
                           <input type='password' placeholder='enter password' required />
                           <motion.button
                              whileHover={{ color: '#ffff', backgroundColor: '#73afe7' }}
                              whileTap={{ scale: 0.9 }}
                              type='submit'
                           >
                              Change
                           </motion.button>
                        </form>
                     </motion.div>
                  )}
                  {changePass && (
                     <motion.div
                        initial={{ opacity: 0, x: '20vw' }}
                        animate={{ opacity: 1, x: 0 }}
                        className='change_pass'
                     >
                        <p>Enter your new Password</p>
                        <form
                           onSubmit={e => {
                              e.preventDefault();
                              if (e.target) {
                                 setLoading(true);
                                 changePassword(e);
                              }
                           }}
                        >
                           <input
                              type='password'
                              placeholder='enter current password'
                              required
                           />
                           <input
                              type='password'
                              placeholder='enter new password'
                              required
                           />
                           <input
                              type='password'
                              placeholder='repeat password'
                              required
                           />
                           <motion.button
                              whileHover={{ color: '#ffff', backgroundColor: '#73afe7' }}
                              whileTap={{ scale: 0.9 }}
                              type='submit'
                           >
                              Change
                           </motion.button>
                        </form>
                     </motion.div>
                  )}
                  {err && (
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
                        {err === 'auth/wrong-password' && <p>Wrong password</p>}
                     </div>
                  )}
                  {err && console.log(err)}
               </motion.div>
            )}
         </AnimatePresence>
         {loading && (
            <div className='loading_container'>
               <LoadingType2 />
            </div>
         )}
         {success && (
            <motion.div
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               className='success_container'
            >
               <div className='success'>
                  <p>Success</p>
                  <img src={require('../assets/success.png')} alt='' />
               </div>
            </motion.div>
         )}
      </div>
   );
};

export default Settings;
