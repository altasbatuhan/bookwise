import React, { useState, useEffect } from "react";
import { showToast } from "../toastConfig";

function LikeButton({ isbn13, likedBooks, onUpdateLikedBooks }) {
  // Accepts book ISBN, liked books array, and a function to update liked books
  const [liked, setLiked] = useState(false); // Initialize state for like status

  useEffect(() => {
    // Update liked state based on likedBooks when the component mounts or dependencies change
    setLiked(likedBooks.includes(isbn13)); // Check if the book is in the likedBooks array
  }, [likedBooks, isbn13]); // Dependencies for the effect

  const handleLike = async () => {
    // Function to handle like/unlike action
    try {
      const userId = JSON.parse(sessionStorage.getItem("user"))?.user_id; // Get user ID from session storage
      const response = await fetch(
        `http://localhost:5000/books/liked/${userId}`, // API endpoint for liking/unliking books
        {
          method: liked ? "DELETE" : "POST", // Use DELETE to unlike, POST to like
          headers: {
            "Content-Type": "application/json", // Set content type for the request
          },
          body: JSON.stringify({ isbn13: isbn13 }), // Send the ISBN in the request body
        }
      );

      if (response.ok) {
        setLiked(!liked); // Toggle the liked state
        const message = liked
          ? "Book unliked!" // Message for unliking
          : "Book liked!"; // Message for liking
        // alert(message); // Show an alert message (commented out)
        showToast("success", message); // Call the onUpdateLikedBooks function to update the parent component
        if (onUpdateLikedBooks) {
          onUpdateLikedBooks(isbn13, !liked);
        }
      } else {
        console.error("Error during the operation:", response.status); // Log the error
        alert("An error occurred."); // Show an error alert
      }
    } catch (error) {
      console.error("Error during the operation:", error); // Log the error
      alert("An error occurred."); // Show an error alert
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
          fil="black"
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

export default LikeButton; // Export the component
