// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  // Toggle new project form visibility
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [images, setImages] = useState([]);
  // Local state for cropping uploaded input images
  const [rawFiles, setRawFiles] = useState([]);
  const [isCropping, setIsCropping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  // Callback when crop is complete to store pixel area
  const onCropComplete = useCallback((_, croppedArea) => {
    setCroppedAreaPixels(croppedArea);
  }, []);
  const navigate = useNavigate();
  // Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        navigate('/login');
      }
    });
    return unsubscribeAuth;
  }, [navigate]);
  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  // Firestore: load projects for user
  useEffect(() => {
    if (!user) return;
    const projectsRef = collection(db, 'projects');
    const q = query(projectsRef, where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProjects(projs);
    });
    return unsubscribe;
  }, [user]);

  // Firestore: load images for active project (if needed for outputs)
  useEffect(() => {
    if (!activeProject) return;
    const imagesRef = collection(db, 'projects', activeProject.id, 'images');
    const unsubscribe = onSnapshot(imagesRef, (snapshot) => {
      const imgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setImages(imgs);
    });
    return unsubscribe;
  }, [activeProject]);

  // Create new project
  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        name: projectName,
        description: projectDesc,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setProjectName('');
      setProjectDesc('');
      setActiveProject({ id: docRef.id, name: projectName });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  // Handle selection of input images: start cropping flow (max 10)
  const handleInputUpload = (e) => {
    const files = Array.from(e.target.files);
    const existingInputs = images.filter((img) => img.type === 'input');
    const remaining = 10 - existingInputs.length;
    const toProcess = files.slice(0, remaining);
    if (toProcess.length > 0) {
      setRawFiles(toProcess.map((file) => ({ file, fileUrl: URL.createObjectURL(file) })));
      setCurrentIndex(0);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsCropping(true);
    }
    e.target.value = null;
  };
  // Upload a cropped input image to storage and Firestore
  const uploadCroppedFile = async (blob, originalName) => {
    const filename = `${Date.now()}_${originalName}`;
    const storageRef = ref(storage, `images/${user.uid}/${activeProject.id}/input/${filename}`);
    try {
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'projects', activeProject.id, 'images'), {
        type: 'input',
        url,
        imageId: filename,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error uploading cropped image:', err);
    }
  };
  // Confirm current crop, upload it, and proceed to next image or finish
  const handleConfirmCrop = async () => {
    const rawFileObj = rawFiles[currentIndex];
    if (!rawFileObj) return;
    try {
      const { blob } = await getCroppedImg(rawFileObj.fileUrl, croppedAreaPixels);
      await uploadCroppedFile(blob, rawFileObj.file.name);
      if (currentIndex + 1 < rawFiles.length) {
        setCurrentIndex(currentIndex + 1);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      } else {
        // Finished cropping all images
        setIsCropping(false);
        setRawFiles([]);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Error in cropping and uploading:', err);
    }
  };

  // Upload output images for an input (max 3)
  const handleOutputUpload = async (e, inputId) => {
    const files = Array.from(e.target.files || []);
    const existingOut = images.filter((img) => img.type === 'output' && img.originalInputId === inputId);
    const remaining = 3 - existingOut.length;
    const toUpload = files.slice(0, remaining);
    for (const file of toUpload) {
      const filename = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `images/${user.uid}/${activeProject.id}/output/${filename}`);
      try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await addDoc(collection(db, 'projects', activeProject.id, 'images'), {
          type: 'output',
          url,
          imageId: filename,
          originalInputId: inputId,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Error uploading output image:', err);
      }
    }
    e.target.value = null;
  };

  const handleBackToProjects = () => {
    setActiveProject(null);
    setImages([]);
    setShowNewProjectForm(false);
  };
  // Render
  // If cropping flow is active, show cropping UI
  if (isCropping) {
    const rawFile = rawFiles[currentIndex];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6">
        <div className="relative w-full max-w-md h-80 bg-black bg-opacity-75 rounded overflow-hidden">
          <Cropper
            image={rawFile.fileUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="w-full max-w-md mt-4">
          <label className="text-white">Zoom</label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex space-x-2 overflow-x-auto w-full max-w-md mt-4">
          {rawFiles.map((rf, idx) => (
            <img
              key={idx}
              src={rf.fileUrl}
              alt={`preview ${idx}`}
              className={`w-16 h-16 object-cover rounded cursor-pointer ${
                idx === currentIndex ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>
        <div className="mt-4 space-x-2">
          <button
            onClick={() => { setIsCropping(false); setRawFiles([]); }}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmCrop}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {currentIndex + 1 < rawFiles.length ? 'Crop & Next' : 'Crop & Finish'}
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen p-6">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <nav className="flex items-center space-x-4">
          <span className="text-lg text-gray-200">
            {user && (user.displayName || user.email)}
          </span>
          <button
            onClick={handleSignOut}
            className="text-gray-200 hover:underline"
          >
            Sign Out
          </button>
        </nav>
      </header>
      <main>
        {!activeProject && (
          <>
            {/* Welcome Section */}
            <section className="bg-black bg-opacity-50 p-6 rounded-md shadow-md mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-white">
                  Welcome, {user && (user.displayName || user.email)}!
                </h2>
                <button
                  onClick={() => navigate("/newProject")}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  New Project
                </button>
              </div>
              {!showNewProjectForm && (
                <p className="mt-4 text-gray-300">
                  This is your dashboard where your projects will appear.
                </p>
              )}
            </section>
            {/* New Project Form */}
            {showNewProjectForm && (
              <section className="bg-black bg-opacity-50 p-6 rounded-md shadow-md mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Create New Project
                </h3>
                <div className="mb-6 space-y-4">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
                    rows={3}
                  />
                  <button
                    onClick={handleCreateProject}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    Create Project
                  </button>
                </div>
              </section>
            )}
            {/* Projects List */}
            <section className="bg-black bg-opacity-50 p-6 rounded-md shadow-md">
              <h2 className="text-xl font-semibold text-white mb-4">
                Your Projects
              </h2>
              {projects.length === 0 ? (
                <p className="text-gray-300">No projects yet.</p>
              ) : (
                <ul className="space-y-2">
                  {projects.map((proj) => (
                    <li key={proj.id}>
                      <button
                        onClick={() => setActiveProject(proj)}
                        className="text-left w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                      >
                        {proj.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
        {activeProject && (
          <section className="bg-black bg-opacity-50 p-6 rounded-md shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                {activeProject.name}
              </h2>
              <button
                onClick={handleBackToProjects}
                className="text-gray-200 hover:underline"
              >
                Back
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-gray-200 mb-2">
                Upload Input Images (up to 10):
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputUpload}
                className="text-gray-200"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images
                .filter((img) => img.type === 'input')
                .map((img) => {
                  const outputs = images.filter(
                    (o) => o.type === 'output' && o.originalInputId === img.id
                  );
                  return (
                    <div key={img.id} className="bg-gray-700 p-2 rounded">
                      <img src={img.url} alt="input" className="w-full h-32 object-cover rounded" />
                      <div className="mt-2">
                        <p className="text-gray-300 text-sm">Status: {img.status}</p>
                        <p className="text-gray-300 text-sm">
                          Outputs: {outputs.length}/3
                        </p>
                        {outputs.length < 3 && (
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleOutputUpload(e, img.id)}
                            className="mt-1 text-gray-200 text-sm"
                          />
                        )}
                        {outputs.map((o) => (
                          <img
                            key={o.id}
                            src={o.url}
                            alt="output"
                            className="w-full h-20 object-cover rounded mt-2"
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
