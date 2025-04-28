import React from "react";


const SelectedProject = ({ project }) => {

    return (
        <>
        <h2 className="text-3xl font-semibold text-white mb-2">{project.name}  <span className='text-gray-200 font-light float-right'>Id: {project.id}</span></h2>
        <p className="text-gray-300 text-xl content-justified font-[450]">{project.description? project.description :"El proyecto no tiene descripción"}</p>
        <div className="mt-4">
            <h3 className="text-2xl font-semibold text-white my-5 border-t-2 border-gray-500 pt-5">Imagenes del proyecto:</h3>
            <ul className="list-disc list-inside text-gray-300">
         
            
            {project.images.map((img, index) => (
                <p 
                className="flex w-full mt-2"
                key={index}>
                    <img src={img.original} 
                    className="w-48 h-48 mr-5 object-cover rounded float-left"
                        alt="" />
                   <span className="flex flex-wrap gap-2 ml-auto">
                   {img.processed.map((processedImg, idx) => {
                        return (
                            <img 
                            key={idx}
                            src={processedImg} 
                            className="w-48 h-48 ml-2 rounded-lg float-right"
                            alt="" />
                        );
                    })}
                   </span>
                </p>
            ))}
            </ul>
        </div>
        </>
    );
}

export default SelectedProject;