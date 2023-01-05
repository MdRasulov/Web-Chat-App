import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthContextProvider } from './context/AuthContext';
import { ChatContextProvider } from './context/ChatContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
   <StrictMode>
      <BrowserRouter basename={process.env.PUBLIC_URL}>
         <AuthContextProvider>
            <ChatContextProvider>
               <App />
            </ChatContextProvider>
         </AuthContextProvider>
      </BrowserRouter>
   </StrictMode>
);
