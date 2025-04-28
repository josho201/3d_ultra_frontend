import react from 'react';


const ProjectList = ({ projects, onSelectProject }) => {



    return(
        <div className="p-4 ">
         {projects.map((project) => (
            <div 
            key={project.id} 
            className="bg-black/50 p-4 rounded-lg mb-4 cursor-pointer hover:bg-black/90 transition duration-200"
            onClick={() => onSelectProject(project)}
            >
                <h3 className="text-xl font-semibold text-white">{project.name} <span className='text-gray-200 font-light float-right'>Id: {project.id}</span> </h3>
                <p className="text-gray-300">
                    {project.description.length > 70 
                        ? `${project.description.substring(0, 70)}...` 
                        : project.description}
                </p>
            </div>
        ))}
        </div>
    )
}

export default ProjectList;