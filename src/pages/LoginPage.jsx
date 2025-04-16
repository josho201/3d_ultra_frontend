// src/pages/LoginPage.jsx
import React from "react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  // No login functionality yet, so this is just UI.
  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just log values; later plug in authentication.
    console.log("Login submitted");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded-md w-80">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 text-sm">
              Email:
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter email"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 text-sm">
              Password:
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
