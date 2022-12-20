import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/pages/login.scss';

function Login() {
   const navigate = useNavigate();

   //Logs in user
   const loginUser = e => {
      e.preventDefault();
      const email = e.target[0].value;
      const password = e.target[1].value;

      signInWithEmailAndPassword(auth, email, password)
         .then(navigate('/'))
         .catch(error => {
            const errorCode = error.code;
            const errorMessage = error.message;
         });
   };

   return (
      <div className='wrapper'>
         <div className='container'>
            <div className='greeting-login'>
               <h1>Welcome Back!</h1>
               <div className='greeting-text'>
                  To keep connected, please, login with your personal
                  information
               </div>
               <div className='sign-in_link'>
                  Still don't have an account?
                  <Link to={'/register'}>Sing Up</Link>
               </div>
            </div>
            <div className='form-container'>
               <span className='logo'>Web Chat</span>
               <span className='title'>Login</span>
               <form
                  onSubmit={e => {
                     loginUser(e);
                  }}
               >
                  <input type='mail' placeholder='mail' required />
                  <input type='password' placeholder='password' required />
                  <button type='submit'>Sign In</button>
               </form>
            </div>
         </div>
      </div>
   );
}

export default Login;
