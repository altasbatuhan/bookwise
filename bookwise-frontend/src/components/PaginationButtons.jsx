// src/components/PaginationButtons.jsx
function PaginationButtons({ page, nextPage, prevPage }) {
  // Accepts the current page number and functions for navigating to next/previous pages
  return (
    <div className="flex items-center mt-6 gap-x-2 justify-center w-fulln">
      {/* Container for the buttons with styling */}
      {/* Previous Button */}
      <button
        onClick={prevPage} // Call the prevPage function when clicked
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        // Styling and disabled state styling
        disabled={page === 1} // Disable the button if on the first page
      >
        Previous {/* Display "Previous" */}
      </button>
      {/* Page number */}
      <span className="text-xl">Page {page}</span>{" "}
      {/* Display the current page number */}
      {/* Next Button */}
      <button
        onClick={nextPage} // Call the nextPage function when clicked
        className="bg-blue-500 text-white px-4 py-2 rounded" // Styling
      >
        Next {/* Display "Next" */}
      </button>
    </div>
  );
}

export default PaginationButtons; // Export the component
