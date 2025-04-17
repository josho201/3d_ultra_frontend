// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    // Redirect to login if no authenticated user
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        navigate('/login');
      }
    });
    return unsubscribe;
  }, [navigate]);
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  // This is the dashboard after authentication
  return (
    <div className="min-h-screen bg-gray-400 p-6">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <nav className="flex items-center space-x-4">
          <span className="text-lg text-gray-800">
            {user && (user.displayName || user.email)}
          </span>
          <button
            onClick={handleSignOut}
            className="text-blue-500 hover:underline"
          >
            Sign Out
          </button>
        </nav>
      </header>
      <main>
        <section className="bg-gray-800 p-6 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome, {user && (user.displayName || user.email)}!
          </h2>
          <p className="mb-4">
            This is your dashboard where projects will appear. Start by creating a new project or viewing
            your previous projects.
          </p>
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            New Project
          </button>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
