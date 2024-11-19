import React from "react";

function StarRating({ rating }) {
  // Include the rating prop
  return (
    <div className="flex">
      {/* Add margin to shift stars slightly to the right of the title */}
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`cursor-pointer text-xl ${
            star <= rating ? "text-yellow-400" : "text-gray-500"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default StarRating;
