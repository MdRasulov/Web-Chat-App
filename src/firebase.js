import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
   apiKey: 'AIzaSyCFV4nHRvvHzg9CdZQGR7QDA9myNteTiKs',
   authDomain: 'chat-app-be141.firebaseapp.com',
   projectId: 'chat-app-be141',
   storageBucket: 'chat-app-be141.appspot.com',
   messagingSenderId: '146196392919',
   appId: '1:146196392919:web:6d033813f7582352d27992',
};

// init firebase app
const app = initializeApp(firebaseConfig);

// init and exporting services in order to use it anywhere in code
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
