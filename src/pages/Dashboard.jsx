// src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // This is a placeholder for where the user lands after auth.
  return (
    <div className="min-h-screen bg-gray-400 p-6">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <nav>
          <Link to="/login" className="text-blue-500 hover:underline">
            Logout
          </Link>
        </nav>
      </header>
      <main>
        <section className="bg-gray-800 p-6 rounded-md shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome, to NsComoSeLLamara!
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
