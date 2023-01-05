import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/pages/login.scss';
import { useState } from 'react';
import { motion } from 'framer-motion';

function Login() {
   const navigate = useNavigate();
   const [err, setErr] = useState(false);

   //Logs in user
   const loginUser = e => {
      e.preventDefault();
      const email = e.target[0].value;
      const password = e.target[1].value;

      signInWithEmailAndPassword(auth, email, password)
         .then(() => {
            setErr(false);
            navigate('/');
         })
         .catch(error => {
            setErr(true);
         });
   };

   return (
      <div className='wrapper'>
         <div className='container'>
            <div className='greeting-login'>
               <h1>Welcome Back!</h1>
               <div className='greeting-text'>
                  To keep connected, please, login with your personal information
               </div>
               <div className='sign-in_link'>
                  Still don't have an account?
                  <motion.div whileHover={{ scale: 1.1 }} className='link'>
                     <Link to={'/register'}>Sing Up</Link>
                  </motion.div>
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
                  <motion.button
                     whileHover={{ backgroundColor: '#73afe7', color: '#ffff' }}
                     whileTap={{ scale: 0.9 }}
                     type='submit'
                  >
                     Sign In
                  </motion.button>
               </form>
               {err && (
                  <div className='error_message'>
                     <p>Invalid email or password</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

export default Login;
