import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { showToast } from "../toastConfig";
import apiService from "../services/apiService";

function SettingsPage() {
  const [editing, setEditing] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [user, setUser] = useState(() =>
    JSON.parse(sessionStorage.getItem("user"))
  );
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setShowForm(false);
  }, []);

  const handleEditClick = (field) => {
    setEditing(field);
    setShowForm(true);
    setCurrentPassword("");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    if (field === "username") setUsername(user.username);
    else if (field === "email") setEmail(user.email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (editing === "password" && newPassword !== confirmPassword) {
      showToast("error", "New passwords do not match.");
      return;
    }

    try {
      // Prepare the updated data object
      const updatedData = {
        current_password: currentPassword,
        username: username,
        email: email,
      };

      if (editing === "password") {
        updatedData.old_password = oldPassword;
        updatedData.new_password = newPassword;
      }

      // Use apiService to update user data
      const data = await apiService.updateUser(user.user_id, updatedData);

      // Update user data in session storage
      setUser(data.user);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      showToast("success", data.message);

      // Clear the form fields after successful update
      setEditing(null);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setUsername("");
      setEmail("");
      setShowForm(false); // Hide the form after successful update
    } catch (error) {
      console.error("Update error:", error);
      showToast("error", error.message || "An error occurred while updating.");
    }
  };

  const handleDeleteClick = async (event) => {
    event.preventDefault();

    if (!currentPassword || currentPassword !== confirmPassword) {
      showToast("error", "Please enter your password and confirm it.");
      return;
    }

    try {
      // Use apiService to delete the user account
      await apiService.deleteUser(user.user_id, currentPassword);

      showToast(
        "success",
        "Your account has been successfully deleted. Redirecting to login..."
      );
      sessionStorage.removeItem("user");
      setTimeout(() => {
        window.location.href = "/auth";
      }, 3000);
    } catch (error) {
      showToast("error", error.message || "An error occurred.");
    }
  };
  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen bg-bookwise-blue">
        <div
          className={`bg-bookwise-gray p-8 rounded-lg shadow-lg text-center flex max-w-4xl ${
            showForm ? "w-full" : "w-1/4"
          }`}
        >
          <div className={`pr-4 ${showForm ? "w-1/2" : "w-full"}`}>
            <h2 className="text-xl text-white font-bold mb-4">
              User Information
            </h2>

            <div className="flex flex-col space-y-10 ">
              <div className=" grid grid-cols-2">
                <div className="flex flex-col ">
                  <label className="block text-white font-bold text-left mb-2">
                    Username
                  </label>
                  <span className="text-white mr-2 text-left">
                    {user.username}
                  </span>
                </div>

                <button
                  onClick={() => handleEditClick("username")}
                  className="text-blue-500 font-bold rounded focus:outline-none focus:shadow-outline dark:hover:text-sky-400 p-0 m-0"
                >
                  Update Username
                </button>
              </div>

              <div>
                <div className="grid grid-cols-2">
                  <div className="flex flex-col">
                    <label className="block text-white font-bold text-left mb-2">
                      E-mail
                    </label>
                    <span className="text-white mr-2 text-left">
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEditClick("email")}
                    className="text-blue-500 font-bold rounded focus:outline-none focus:shadow-outline dark:hover:text-sky-400"
                  >
                    Update E-mail
                  </button>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2">
                  <div className="flex flex-col">
                    <label className="block text-white font-bold text-left mb-2 ">
                      Password
                    </label>
                    <span className="text-white mr-2 text-left">********</span>
                  </div>

                  <button
                    onClick={() => handleEditClick("password")}
                    className="text-blue-500 font-bold rounded focus:outline-none focus:shadow-outline dark:hover:text-sky-400"
                  >
                    Change Password
                  </button>
                </div>
                <button
                  onClick={() => handleEditClick("deleteAccount")}
                  className="text-blue-500 font-bold rounded focus:outline-none focus:shadow-outline self-start text-sm dark:hover:text-sky-400 mt-10"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
          {showForm && ( // This should encompass all the forms
            <div className="w-1/2 pl-4 border-l border-gray-700">
              {editing === "username" && (
                <div>
                  <h2 className="text-xl text-white font-bold mb-4">
                    Change Username
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label
                        htmlFor="username"
                        className="block text-white text-left mb-2"
                      >
                        New Username
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-400 p-2 rounded-md"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="currentPassword"
                        className="block text-white text-left mb-2"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-400 p-2 rounded-md"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline "
                    >
                      Update Username
                    </button>
                  </form>
                </div>
              )}
              {editing === "email" && (
                <div>
                  <h2 className="text-xl text-white font-bold mb-4">
                    Change Email
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-white text-left mb-2"
                      >
                        New Email
                      </label>
                      <input
                        type="email"
                        className="w-full border border-gray-400 p-2 rounded-md"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="currentPassword"
                        className="block text-white text-left mb-2"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-400 p-2 rounded-md"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Update Email
                    </button>
                  </form>
                </div>
              )}
              {editing === "password" && (
                <div>
                  <h2 className="text-xl text-white font-bold mb-4">
                    Change Password
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label
                        htmlFor="oldPassword"
                        className="block text-white text-left mb-2"
                      >
                        Old Password
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-400 p-2 rounded-md"
                        id="oldPassword"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="newPassword"
                        className="block text-white text-left mb-2"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-400 p-2 rounded-md"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-white text-left mb-2"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-400 p-2 rounded-md"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Change Password
                    </button>
                  </form>
                </div>
              )}
              {editing === "deleteAccount" && (
                <div>
                  <h2 className="text-xl text-white font-bold mb-4">
                    Confirm Account Deletion
                  </h2>
                  <form onSubmit={handleDeleteClick}>
                    <div className="mb-4">
                      <label
                        htmlFor="currentPassword"
                        className="block text-white text-left mb-2"
                      >
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-400 p-2 rounded-md"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-white text-left mb-2"
                      >
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="w-full border border-gray-400 p-2 rounded-md"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    {currentPassword &&
                      confirmPassword &&
                      currentPassword !== confirmPassword && (
                        <p className="text-red-500 text-sm">
                          Passwords do not match!
                        </p>
                      )}
                    <button
                      type="submit"
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                      Confirm Deletion
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
