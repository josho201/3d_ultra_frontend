// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";


import {Header} from "../components/header"
import SearchBar from "../components/Search";
import SelectedProject from "../components/SelectedProject"; 
import ProjectList from "../components/ProjectList";
const Dashboard = () => {
  const navigate = useNavigate();
  
  const [selectedProject, setSelectedProject] = useState({
    id: "1",
    name: "Project 1",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    images: [
      {original: "https://placehold.co/1024x1024?text=img1&font=montserrat", processed: ["https://placehold.co/1024x1024?text=imgp1&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat","https://placehold.co/1024x1024?text=imgp1&font=montserrat"] },
      {original: "https://placehold.co/1024x1024?text=img1&font=montserrat", processed: ["https://placehold.co/1024x1024?text=imgp2&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat"] },
      {original: "https://placehold.co/1024x1024?text=img1&font=montserrat  ", processed: ["https://placehold.co/1024x1024?text=imgp12&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat"] },
      {original: "https://placehold.co/1024x1024?text=img1&font=montserrat", processed: ["https://placehold.co/1024x1024?text=imgp1&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat","https://placehold.co/1024x1024?text=imgp1&font=montserrat"] },
      {original: "https://placehold.co/1024x1024?text=img1&font=montserrat", processed: ["https://placehold.co/1024x1024?text=imgp2&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat"] },
      {original: "https://placehold.co/1024x1024?text=img1&font=montserrat  ", processed: ["https://placehold.co/1024x1024?text=imgp12&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat", "https://placehold.co/1024x1024?text=imgp1&font=montserrat"] },
    
    ],
  });

  

  return (
    <div className="min-h-screen ">
      <Header 
        Title={"Tablero"}
      />
      <main className="p-6">
        <div className="mb-4 w-5/6 mx-auto">  
          
          <div className="space-x-8 w-1/1 bg-black/50 p-10 rounded-xl">
           <div className="flex" >
           {/*Left side: projects list */}
            <div className="w-2/5  mr-5 bg-[#0f172a] rounded-lg shadow-md">
            <h2
                className="text-3xl font-bold text-white p-5 pb-1"
            >Tus proyectos</h2>
                
            <SearchBar />
            <ProjectList 
              projects={[selectedProject]}
              onSelectProject ={setSelectedProject}
            />
            </div>


            {/*right side: selected project */}
            <div className="w-3/5  space-y-4 p-5  bg-[#0f172a] rounded-lg shadow-md border-solid  border-2 border-[#54b7ef]" >
            {selectedProject ? (
              <SelectedProject project={selectedProject} />)

              : (<h1>ningun proyecyo seleccionado</h1>)}
            </div>
           </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
