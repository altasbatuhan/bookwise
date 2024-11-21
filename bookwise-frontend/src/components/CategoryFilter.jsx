import React, { useMemo } from "react";

function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  const sortedCategories = useMemo(
    () =>
      categories?.sort((a, b) => a?.category?.localeCompare(b?.category)) || [],
    [categories]
  );
  const rankedCategories = useMemo(
    () =>
      categories
        ? [...categories]
            .sort((a, b) => b.book_count - a.book_count)
            ?.slice(0, 7)
        : [],
    [categories]
  );

  return (
    <div className="flex max-lg:flex-col max-lg:w-full gap-4">
      {/* Container for the filter, using flexbox for layout */}
      {/* Flex direction is set to column for small screens */}

      {/* Buttons for the first 5 categories */}
      <div className="flex max-lg:hidden gap-4">
        {/* Flex container for medium and large screens */}
        {rankedCategories.slice(0, 7).map(
          (
            category,
            index // Map over the first 5 categories
          ) => (
            <button
              key={index + category.book_count + category.category} // Unique key for each button
              className={`bg-blue-500 text-white px-4 py-2 rounded ${
                selectedCategory === category.category
                  ? "bg-blue-700 dark:hover:bg-blue-800"
                  : ""
                // Apply active class if the category is selected
              }`}
              onClick={() => onCategoryChange(category.category)} // Call the onCategoryChange function when clicked
            >
              {category.category} {/* Display category name and book count */}
            </button>
          )
        )}
      </div>

      {/* Dropdown for other categories */}
      <div className="relative flex">
        <select
          value={selectedCategory} // Set the selected category as the value
          onChange={(e) => onCategoryChange(e.target.value)} // Call onCategoryChange with the selected value
          className="bg-blue-500 text-white px-4 py-2 rounded w-full max-lg:text-center max-lg:w-full "
          // Responsive width for the dropdown
        >
          <option value="">Select a Category</option> {/* Default option */}
          {sortedCategories.map(
            (
              category,
              index // Map over all categories
            ) => (
              <option
                key={index + category.book_count + category.category}
                value={category.category}
              >
                {/* Display category name and book count in each option */}
                {category.category}
              </option>
            )
          )}
        </select>
      </div>
    </div>
  );
}

export default CategoryFilter;
