import React, { useState, useEffect } from "react";
import apiService from "../services/apiService";
import { showToast } from "../toastConfig";

function LikeButton({ isbn13, likedBooks, onUpdateLikedBooks }) {
  const [liked, setLiked] = useState(false); // Initialize state for like status

  useEffect(() => {
    // Update liked state based on likedBooks when the component mounts or dependencies change
    setLiked(likedBooks.includes(isbn13)); // Check if the book is in the likedBooks array
  }, [likedBooks, isbn13]); // Dependencies for the effect

  const handleLike = async () => {
    // Function to handle like/unlike action
    try {
      const userId = JSON.parse(sessionStorage.getItem("user"))?.user_id; // Get user ID from session storage

      let response;
      if (liked) {
        // If the book is already liked, unlike it
        response = await apiService.deleteLike(userId, isbn13);
      } else {
        // If the book is not liked, like it
        response = await apiService.likeBook(userId, isbn13);
      }

      if (response?.message) {
        setLiked(!liked); // Toggle the liked state
        const message = liked ? "Book unliked!" : "Book liked!"; // Success message
        showToast("success", message); // Show success toast

        if (onUpdateLikedBooks) {
          onUpdateLikedBooks(isbn13, !liked); // Callback to update likedBooks in the parent
        }
      } else {
        console.error("Error during the operation:", response); // Log the error
        showToast("error", "An error occurred.");
      }
    } catch (error) {
      console.error("Error during the operation:", error); // Log the error
      showToast("error", "An error occurred.");
    }
  };

  return (
    <button onClick={handleLike} className="rounded-full hover:bg-gray-700">
      {/* Button to trigger the like/unlike action */}
      {/* Display a filled heart if liked, otherwise an empty heart */}
      {liked ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-6 h-6 fill-red-600" // Filled heart icon
        >
          {/* SVG path for filled heart */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="black"
          stroke="currentColor"
          className="w-6 h-6" // Empty heart icon
        >
          {/* SVG path for empty heart */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      )}
    </button>
  );
}

export default LikeButton;
