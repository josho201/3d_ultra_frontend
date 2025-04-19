// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Cropper from "react-easy-crop";

// Utility to create an HTMLImageElement from a URL
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

// Utility to get the cropped image as a blob and URL
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

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

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      const fileUrl = URL.createObjectURL(blob);
      resolve({ blob, fileUrl });
    }, "image/png");
  });
}

const Dashboard = () => {
  const [user, setUser] = useState(null);
  // New project and cropping states
  const [showNewProject, setShowNewProject] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
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
  // Handlers for image cropping and project submission
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result);
      };
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSubmitProject = async () => {
    try {
      const { blob, fileUrl } = await getCroppedImg(imageSrc, croppedAreaPixels);
      // Trigger download of the cropped image
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'cropped_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileUrl);
      // Reset state
      setShowNewProject(false);
      setImageSrc(null);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    } catch (error) {
      console.error('Error cropping image:', error);
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
        <section className="bg-gray-800 p-6 rounded-md shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome, {user && (user.displayName || user.email)}!
          </h2>
          <p className="mb-4">
            This is your dashboard where projects will appear. Start by creating a new project or viewing
            your previous projects.
          </p>
          {!showNewProject && (
            <button
              onClick={() => setShowNewProject(true)}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              New Project
            </button>
          )}
        </section>
        {showNewProject && (
          <section className="bg-white p-6 rounded-md shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">New Project</h2>
          {!imageSrc && (
            <input type="file" accept="image/*" onChange={onSelectFile} />
          )}
          {imageSrc && (
            <>
              <div className="relative w-full h-64 bg-gray-200 mb-4">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-gray-700">Zoom</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </div>
              <button
                onClick={handleSubmitProject}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 mr-2"
              >
                Submit Project
              </button>
              <button
                onClick={() => setShowNewProject(false)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </>
          )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
