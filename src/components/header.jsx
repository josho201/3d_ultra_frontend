
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header itemID='head' className="mb-6 flex justify-between items-center p-6 m-0">
     <img src="src/assets/logo2.png" className='h-20' alt="" />
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <nav className="flex items-center space-x-4">
        <span className="text-lg text-gray-200">
          {user && (user.displayName || user.email)}
        </span>
        <button
          onClick={handleSignOut}
          className="text-gray-200 hover:underline"
        >
          Sign Out
        </button>
      </nav>

    
    </header>
  );
}

export { Header };