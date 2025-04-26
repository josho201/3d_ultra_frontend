// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";


import {Header} from "../components/header"
import SearchBar from "../components/Search";
import SelectedProject from "../components/SelectedProject"; 

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [selectedProject, setSelectedProject] = useState({
    id: "1",
    name: "Project 1",
    images: [
      {original: "https://placehold.co/1024x1024?text=img1&font=montserrat", processed: ["https://placehold.co/1024x1024?text=imgp1&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat","https://placehold.co/1024x1024?text=imgp1&font=montserrat"] },
      {original: "https://placehold.co/1024x1024?text=img1&font=montserrat", processed: ["https://placehold.co/1024x1024?text=imgp2&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat"] },
      {original: "https://placehold.co/1024x1024?text=img1&font=montserrat  ", processed: ["https://placehold.co/1024x1024?text=imgp12&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat"] },
    ],
  });

  

  return (
    <div className="min-h-screen ">
      <Header />
      <main className="p-6">
        <div className="mb-4">
          
          <div className="space-x-8 w-1/1 bg-black/50 p-10 rounded-xl">
           <div className="flex" >
           {/*Left side: projects list */}
            <div className="w-1/3  mr-5 ">
            <h2
                className="text-3xl font-bold text-white p-5"
            >Hey project list</h2>
                
            <SearchBar />
            </div>

            {/*right side: selected project */}
            <div className="w-2/3  space-y-4 p-5">
            {selectedProject ? (
              <SelectedProject project={selectedProject} />)

              : (<h1>No project selected</h1>)}
            </div>
           </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
