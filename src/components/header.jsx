
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Header({
  Title
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header itemID='head' className="mb-6  bg-black/50  flex justify-between items-center p-6 m-0">
     <img 
      onClick={() => navigate('/')}
      src="src/assets/logo2.png" 
      className='h-10 cursor-pointer' 
      alt=""
       />
      <h1 className="text-4xl font-bold text-white">{Title}</h1>

      <nav className="flex items-center space-x-4">
      <span className="text-lg text-gray-200">
        {user && (user.displayName || user.email)}
      </span>

      <span className=' border-l-2 border-l-gray-400 pl-2'>
        <button
          onClick={handleSignOut}
          className="text-gray-200 text-lg hover:underline cursor-pointer"
        >
          Cerrar sesión
        </button>
      </span>
      </nav>    
    </header>
    );
}

export { Header };