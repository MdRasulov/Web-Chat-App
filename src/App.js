import { Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

function App() {
   const { currentUser } = useContext(AuthContext);

   return (
      <div className='App'>
         <Routes>
            <Route path='/'>
               <Route index element={currentUser ? <Home /> : <Login />} />
               <Route path='login' element={<Login />} />
               <Route path='register' element={<Register />} />
            </Route>
         </Routes>
      </div>
   );
}

export default App;
