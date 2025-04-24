// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";


import {Header} from "../components/header"

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6">
      <Header />
      <main>
        <div className="mb-4">
          <button
            onClick={() => navigate('/newProject')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Project +
          </button>

      <img src="src/assets/logo.svg" alt="" className=''/>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
