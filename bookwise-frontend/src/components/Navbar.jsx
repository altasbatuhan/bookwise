import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ onHomePageClick }) => {
  // Accepts a function to be called when the home page link is clicked
  const [user] = useState(() => JSON.parse(sessionStorage.getItem("user")));
  // Get user data from session storage

  const handleLogout = () => {
    sessionStorage.removeItem("user"); // Remove user data from session storage
    window.location.reload(); // Reload the page
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-bookwise-gray text-white">
      {/* Navbar container with styling */}
      <div className="text-lg font-bold w-fit dark:hover:text-sky-400">
        {/* Container for the website name/logo */}
        <Link to="/" onClick={onHomePageClick}>
          {" "}
          {/* Link to the home page */}
          BookWise {/* Display "HomePage" */}
        </Link>
      </div>

      <div className="flex space-x-4">
        {/* Container for navigation links */}
        {user ? (
          // Conditionally render links based on user login status
          <>
            {/* Fragment to group elements */}
            <Link
              to="/favorites"
              className="text-white dark:hover:text-sky-400"
            >
              {/* Link to the favorites page */}
              Liked Books {/* Display "Liked Books" */}
            </Link>
            <Link to="/settings" className="text-white dark:hover:text-sky-400">
              {/* Link to the settings page */}
              Settings {/* Display "Ayarlar" */}
            </Link>{" "}
            {/* Settings link */}
            <button
              className="text-white dark:hover:text-sky-400"
              onClick={handleLogout} // Call handleLogout function when clicked
            >
              Logout {/* Display "Logout" */}
            </button>
          </>
        ) : (
          <>
            {/* Fragment to group elements */}
            <Link to="/auth" className="text-white hover:text-gray-400">
              {/* Link to the login page */}
              Login {/* Display "Login" */}
            </Link>
            <Link to="/auth" className="text-white hover:text-gray-400">
              {/* Link to the register page */}
              Register {/* Display "Register" */}
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; // Export the component
