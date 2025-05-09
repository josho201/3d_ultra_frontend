import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useEffect } from 'react';



const SearchBar = ({onSearch}) => {
    const navigate = useNavigate();
    
    const handleSearch = (e) => {

        e.preventDefault();

    }

    return (
        <form className="flex items-center p-5 gap-2 w-full" onSubmit={handleSearch}>
           

            <input 
                type="text" 
                id="simple-search" 
                className="flex-grow bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                placeholder="Busca por ID o nombre de proyecto" 
                required
            />

            <button 
                type="submit" 
                className="p-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg border hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
                <span className="sr-only">Busqueda</span>
            </button>

            <button
                onClick={(e) => {e.preventDefault(); navigate('/newProject')}}
                className="p-2 text-sm font-medium text-white bg-blue-700 rounded-lg border hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
                Nuevo proyecto
            </button>
        </form>

    )
}

export default SearchBar;
//               required
//             />





