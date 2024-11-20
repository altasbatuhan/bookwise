import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast } from "../toastConfig";
import apiService from "../services/apiService";

function Auth() {
  // Initialize useNavigate for navigation
  const navigate = useNavigate();

  // State variables for username, password, email, and login/register toggle
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true); // True for login, false for register

  // Function to handle login form submission
  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    try {
      // Send login request using apiService
      const data = await apiService.login({ username, password });

      // If login is successful
      if (data?.user) {
        console.log("Login response:", data); // Log the response data
        sessionStorage.setItem("user", JSON.stringify(data.user)); // Save user information to session storage
        showToast("success", "Login successful!");
        navigate("/"); // Redirect to homepage
      } else {
        console.log("Login failed:", data); // Log the error message to console
        showToast("error", data?.error || "Login failed."); // Display error message
      }
    } catch (error) {
      console.error("Login error:", error); // Log the error message to console
      showToast("error", error.message || "An error occurred."); // Display error message
    }
  };

  // Function to handle register form submission
  const handleRegister = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    try {
      //  Register using apiService
      const data = await apiService.register({ username, email, password });

      console.log("Registration response:", data); // Log the response to console

      // If there is a user object in the data, registration is successful
      if (data?.message) {
        showToast("success", data.message); // Show success message
        setIsLogin(true); // Switch to login form
      }
    } catch (error) {
      console.error("Register error:", error);
      showToast("error", error.message || "An error occurred.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bookwise-blue">
      {/* Main container for the authentication form */}
      <div className="bg-bookwise-gray p-8 rounded-lg shadow-lg text-center w-full max-w-md">
        {/* Conditionally render login or register form */}
        {isLogin ? (
          <>
            <h2 className="text-2xl text-white font-bold mb-4">Log In</h2>
            <form onSubmit={handleLogin}>
              {/* Login form */}
              <div className="mb-4">
                {/* Input field for username */}
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-gray-400 p-2 rounded-md"
                />
              </div>
              <div className="mb-4">
                {/* Input field for password */}
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-400 p-2 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {/* Submit button for login */}
                Log In
              </button>
            </form>
            <p className="mt-4 text-white">
              {/* Link to switch to register form */}
              New to Bookwise?{" "}
              <button
                className="text-blue-500 hover:text-blue-700 font-bold"
                onClick={() => setIsLogin(false)}
              >
                Join Now!
              </button>
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl text-white font-bold mb-4">Register</h2>
            <form onSubmit={handleRegister}>
              {/* Register form */}
              <div className="mb-4">
                {/* Input field for username */}
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border border-gray-400 p-2 rounded-md"
                />
              </div>
              <div className="mb-4">
                {/* Input field for email */}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-400 p-2 rounded-md"
                />
              </div>
              <div className="mb-4">
                {/* Input field for password */}
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-400 p-2 rounded-md"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {/* Submit button for register */}
                Register
              </button>
            </form>
            <p className="mt-4 text-white">
              {/* Link to switch to login form */}
              Already have an account?{" "}
              <button
                className="text-blue-500 hover:text-blue-700 font-bold"
                onClick={() => setIsLogin(true)}
              >
                Log In
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Auth;
