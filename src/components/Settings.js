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
import LoadingType2 from '../loadingAnimations/loadingType2/LoadingType2';
import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db, storage } from '../firebase';

const Settings = ({ setSettingState, setModal, combinedId }) => {
   const { currentUser } = useContext(AuthContext);
   const [newPhoto, setNewPhoto] = useState();
   const [changeState, setChangeState] = useState(false);
   const [changeName, setChangeName] = useState(false);
   const [changeMail, setChangeMail] = useState(false);
   const [changePass, setChangePass] = useState(false);
   const [loading, setLoading] = useState(false);
   const [err, setErr] = useState();

   const closeEveryModal = () => {
      setModal(false);
      setSettingState(false);
      setLoading(false);
   };

   const closeEveryState = () => {
      setLoading(false);
      setChangeName(false);
      setChangeMail(false);
      setChangePass(false);
      setChangeState(false);
   };

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
            closeEveryModal();
         });
      } catch (error) {
         setErr(error.code);
      }
   };

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
         <button
            className='exit'
            onClick={() => {
               closeEveryModal();
            }}
         >
            <img src={require('../assets/close.png')} alt='' />
         </button>
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
                  <label htmlFor='file'>
                     {newPhoto ? (
                        <>
                           <p className='selected'>Image selected !</p>
                        </>
                     ) : (
                        <>
                           <p className='not-selected'>Select new image</p>
                        </>
                     )}
                  </label>
                  {newPhoto && (
                     <p
                        className='change'
                        onClick={() => {
                           changePhoto();
                           setLoading(true);
                        }}
                     >
                        Click here to change your profile photo
                     </p>
                  )}
               </div>
            </div>
            <div className='userInfo'>
               <div className='userName'>
                  <p>UserName: </p>
                  <span>{currentUser.displayName}</span>
                  <p
                     className='change'
                     onClick={() => {
                        setChangeState(true);
                        setChangeName(true);
                     }}
                  >
                     change
                  </p>
               </div>
               <div className='userEmail'>
                  <p>Email: </p>
                  {currentUser.email}
                  <p
                     className='change'
                     onClick={() => {
                        setChangeState(true);
                        setChangeMail(true);
                     }}
                  >
                     change
                  </p>
               </div>
               <div className='userPass'>
                  <p>Password: </p> ******....
                  <p
                     className='change'
                     onClick={() => {
                        setChangeState(true);
                        setChangePass(true);
                     }}
                  >
                     change
                  </p>
               </div>
            </div>
         </div>
         {loading && (
            <div className='loading_container'>
               <LoadingType2 />
            </div>
         )}
         {changeState && (
            <div className='change_container'>
               <button
                  className='back'
                  onClick={() => {
                     setChangeState(false);
                     setChangeName(false);
                     setChangeMail(false);
                     setChangePass(false);
                     setErr();
                  }}
               >
                  <img src={require('../assets/back.png')} alt='' />
               </button>
               {changeName && (
                  <div className='change_name'>
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
                        <button type='submit'>Change</button>
                     </form>
                  </div>
               )}
               {changeMail && (
                  <div className='change_email'>
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
                        <button type='submit'>Change</button>
                     </form>
                  </div>
               )}
               {changePass && (
                  <div className='change_pass'>
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
                        <input type='password' placeholder='repeat password' required />
                        <button type='submit'>Change</button>
                     </form>
                  </div>
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
            </div>
         )}
      </div>
   );
};

export default Settings;
