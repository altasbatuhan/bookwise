// src/components/RatingStars.jsx
import React, { useState, useEffect } from "react";
import { showToast } from "../toastConfig";

function RatingStars({ isbn13, initialRating, onRatingChange }) {
  // Initialize state variables for current rating and hover rating
  const [rating, setRating] = useState(initialRating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  // Update the rating when the initialRating prop changes
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  // Handle click on a star to set the rating
  const handleClick = (newRating) => {
    setRating(newRating);
    onRatingChange(isbn13, newRating); // Notify the parent component about the rating change

    // Display a success toast notification
    showToast("success", "Book rated successfully!");
  };

  // Handle mouse over a star to set the hover rating
  const handleMouseOver = (newRating) => {
    setHoverRating(newRating);
  };

  // Handle mouse out to reset the hover rating
  const handleMouseOut = () => {
    setHoverRating(0);
  };

  // Render the star elements
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          // Apply Tailwind CSS classes for styling and transitions
          className={`star text-3xl cursor-pointer transition-colors duration-200 
                     ${rating >= i ? "text-yellow-400" : "text-gray-400"} 
                     ${hoverRating >= i ? "text-yellow-500" : ""}`}
          onClick={() => handleClick(i)}
          onMouseOver={() => handleMouseOver(i)}
          onMouseOut={handleMouseOut}
        >
          &#9733; {/* Star character */}
        </span>
      );
    }
    return stars;
  };

  // Render the rating stars container
  return <div className="rating-stars">{renderStars()}</div>;
}

export default RatingStars;
