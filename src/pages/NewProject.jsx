// src/pages/NewProject.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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

// Utility to get the cropped image as a blob
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
      resolve(blob);
    }, "image/png");
  });
}

const NewProject = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
      } else {
        navigate("/login");
      }
    });
    return unsubscribe;
  }, [navigate]);

  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [newProject, setNewProject] = useState(null);

  // Cropping state
  const [rawFiles, setRawFiles] = useState([]);
  const [isCropping, setIsCropping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const onCropComplete = useCallback((_, croppedArea) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  // Create project in Firestore
  const handleCreateProject = async () => {
    if (!projectName.trim() || !user) return;
    try {
      const docRef = await addDoc(collection(db, "projects"), {
        name: projectName,
        description: projectDesc,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewProject({ id: docRef.id, name: projectName });
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  // When files selected, begin cropping flow (max 10)
  const handleInputUpload = (e) => {
    if (!newProject) return;
    const files = Array.from(e.target.files);
    const toProcess = files.slice(0, 10);
    if (toProcess.length > 0) {
      setRawFiles(
        toProcess.map((file) => ({
          file,
          fileUrl: URL.createObjectURL(file),
        }))
      );
      setCurrentIndex(0);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setIsCropping(true);
    }
    e.target.value = null;
  };

  // Upload a cropped file to Storage and Firestore
  const uploadCroppedFile = async (blob, originalName) => {
    const filename = `${Date.now()}_${originalName}`;
    const storageRef = ref(
      storage,
      `images/${user.uid}/${newProject.id}/input/${filename}`
    );
    try {
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      await addDoc(
        collection(db, "projects", newProject.id, "images"),
        {
          type: "input",
          url,
          imageId: filename,
          status: "pending",
          createdAt: serverTimestamp(),
        }
      );
    } catch (err) {
      console.error("Error uploading image:", err);
    }
  };

  // Confirm crop and upload, then proceed
  const handleConfirmCrop = async () => {
    const raw = rawFiles[currentIndex];
    if (!raw) return;
    try {
      const blob = await getCroppedImg(raw.fileUrl, croppedAreaPixels);
      await uploadCroppedFile(blob, raw.file.name);
      if (currentIndex + 1 < rawFiles.length) {
        setCurrentIndex(currentIndex + 1);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      } else {
        // Finished cropping all files
        setIsCropping(false);
        setRawFiles([]);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Crop/upload error:", err);
    }
  };

  // Render cropping UI if active
  if (isCropping && rawFiles[currentIndex]) {
    const raw = rawFiles[currentIndex];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6">
        <div className="relative w-full max-w-md h-80 bg-black bg-opacity-75 rounded overflow-hidden">
          <Cropper
            image={raw.fileUrl}
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
        <div className="mt-4 space-x-2">
          <button
            onClick={() => {
              setIsCropping(false);
              setRawFiles([]);
            }}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmCrop}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {currentIndex + 1 < rawFiles.length
              ? "Crop & Next"
              : "Crop & Finish"}
          </button>
        </div>
      </div>
    );
  }

  // Render new project form or upload interface
  return (
    <div className="min-h-screen p-6 bg-gray-800 text-white">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">New Project</h1>
        <button
          onClick={() => navigate("/")}
          className="text-gray-300 hover:underline"
        >
          Cancel
        </button>
      </header>
      {!newProject ? (
        <div className="space-y-4">
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
      ) : (
        <div className="space-y-4">
          <p>Project "{newProject.name}" created.</p>
          <div>
            <label className="block mb-2">Upload Input Images (up to 10)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleInputUpload}
              className="text-gray-200"
            />
          </div>
          {!isCropping && (
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Done
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NewProject;