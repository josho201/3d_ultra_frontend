import React from "react";


const SelectedProject = ({ project }) => {

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-white mb-2">{project.name}</h2>
        <p className="text-gray-300">{project.description}</p>
        <div className="mt-4">
            <h3 className="text-lg font-semibold text-white">Project Details</h3>
            <ul className="list-disc list-inside text-gray-300">
            <li>Project ID: {project.id}</li>
            
            {project.images.map((img, index) => (
                <p 
                className="flex items-center mt-2"
                key={index}>
                    <img src={img.original} 
                    className="w-48 h-48 mr-5 object-cover rounded-lg"
                        alt="" />
                    {img.processed.map((processedImg, idx) => {
                        return (
                            <img 
                            key={idx}
                            src={processedImg} 
                            className="w-48 h-48 ml-2 rounded-lg"
                            alt="" />
                        );
                    })}
                </p>
            ))}
            </ul>
        </div>
        </div>
    );
}

export default SelectedProject;