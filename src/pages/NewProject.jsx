import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useNavigate } from 'react-router-dom';


import { Header } from '../components/header';
// Helper to create an HTMLImageElement from a URL
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (e) => reject(e));
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = url;
  });

// Helper to crop the image using a canvas and return a blob URL
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      resolve(url);
    }, 'image/jpeg');
  });
}

function NewProject() {
  const navigate = useNavigate();
  // Project metadata
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');

  // Image handling state
  const [originalFiles, setOriginalFiles] = useState([]); // { file, url }
  const [processedImages, setProcessedImages] = useState([]); // blob URLs
  const [currentIndex, setCurrentIndex] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Determine UI mode
  const mode =
    originalFiles.length === 0
      ? 'drop'
      : processedImages.length < originalFiles.length
      ? 'crop'
      : 'review';

  // Drag-and-drop handler
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    if (files.length > 10) files.splice(10);
    const objs = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setOriginalFiles(objs);
  };

  // Cropper callback
  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  // Accept crop and proceed
  const handleAccept = async () => {
    try {
      const imgUrl = await getCroppedImg(
        originalFiles[currentIndex].url,
        croppedAreaPixels
      );
      setProcessedImages((prev) => [...prev, imgUrl]);
      setCurrentIndex((idx) => idx + 1);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (err) {
      console.error('Crop failed:', err);
    }
  };

  // Save handlers
  const handleSave = () => {
    const project = { projectId, projectName, description, images: processedImages };
    console.log('Save Project', project);
  };
  const handleSaveAndProcess = () => {
    const project = { projectId, projectName, description, images: processedImages };
    console.log('Save and Process Project', project);
  };

  return (
    <>
      <Header />
    <div className="my-auto mt-20 flex items-center justify-center ">
     
      <div className="space-x-8 w-8/12 bg-black/50 p-10 rounded-xl" >
       <div className='flex'>

        {/* Left side: inputs and actions */}
        <div className="w-1/2  space-y-4 mr-5">
        <h1 className="text-4xl font-bold text-white mb-6">Crea un nuevo proyecto</h1>
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1">
              ID del Proyecto
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Enter project ID"
              className="w-full mt-1 px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1">
              Nombres del Proyecto
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full mt-1 px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-1">
              Descrición
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              className="w-full mt-1 px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Guardar Proyecto
            </button>
            {mode === 'review' && (
              <button
                onClick={handleSaveAndProcess}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Guardar y Procesar
              </button>
            )}
          </div>
        </div>

        {/* Right side: drop zone, cropper, or review */}
        <div className="w-1/2">
          {mode === 'drop' && (
            <div
              className="w-full h-96 bg-gray-800 border-4 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              Drag & Drop up to 10 Images Here
            </div>
          )}
          {mode === 'crop' && originalFiles[currentIndex] && (
            <>
              {/* Carousel of original images */}
              <div className="flex space-x-2 mb-4 overflow-x-auto">
                {originalFiles.map((obj, idx) => (
                  <img
                    key={idx}
                    src={obj.url}
                    alt="thumb"
                    className={`w-16 h-16 object-cover ${
                      idx === currentIndex ? 'ring-2 ring-blue-400' : ''
                    }`}
                  />
                ))}
              </div>
              {/* Cropper area */}
              <div className="relative w-full h-96 bg-black">
                <Cropper
                  image={originalFiles[currentIndex].url}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              {/* Zoom slider */}
              <div className="mt-4">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <button
                onClick={handleAccept}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Aceptar y siguiente
              </button>
            </>
          )}
          {mode === 'review' && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                {processedImages.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="processed"
                    className="w-32 h-32 object-cover"
                  />
                ))}
              </div>
              <p className="text-gray-200">Todas las imagenes han sido preprocesadas.</p>
            </>
          )}
          <button
            className="mt-8 float-right px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => navigate('/')}
          >
            Salir
          </button>
        </div>
    
       </div>

       <footer className='text-gray-500 border-t border-gray-800 pt-2 text-center mt-5'>
        <span>En caso de dudas o problemas con la aplicacion, contactenos en <a className='soporte' href="mailto:soporte@tinok.online"> soporte@tinok.online</a></span>
       </footer>
      </div>
      
    </div>
    </>
  );
}

export default NewProject;
