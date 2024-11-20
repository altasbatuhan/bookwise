import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import Navbar from "../components/Navbar";
import PaginationButtons from "../components/PaginationButtons";
import CategoryFilter from "../components/CategoryFilter";
import AiPoweredSwitch from "../components/AiPoweredSwitch";
import apiService from "../services/apiService"; // Import the apiService

function HomePage() {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [userId] = useState(
    JSON.parse(sessionStorage.getItem("user"))?.user_id
  );
  const [likedBooks, setLikedBooks] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiPowered, setAiPowered] = useState(false);

  const booksPerPage = 16;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Use apiService to fetch liked books
        const likedBooksData = await apiService.getLikedBooks(userId);
        setLikedBooks(likedBooksData.liked_books.map((book) => book.isbn13));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [selectedCategory, userId]);

  useEffect(() => {
    // Use apiService to fetch categories with book count
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiService.getCategoriesWithBookCount();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (aiPowered && selectedCategory) {
          // Use apiService to fetch AI suggestions
          const suggestions = await apiService.getAISuggestions(
            selectedCategory
          );
          setAiSuggestions(suggestions); // No need for formatting, apiService already returns the correct format
        } else if (selectedCategory) {
          // Use apiService to fetch books with category filter
          const booksData = await apiService.getBooks(
            page,
            booksPerPage,
            selectedCategory
          );
          setBooks(booksData);
        } else {
          // Use apiService to fetch all books
          const booksData = await apiService.getBooks(page, booksPerPage);
          setBooks(booksData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, selectedCategory, aiPowered]);

  // useEffect hook to reset the page to 1 when the selectedCategory changes.
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  // Functions to handle pagination
  const nextPage = () => {
    setPage(page + 1);
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Function to handle home page click (resetting the selected category)
  const handleHomePageClick = () => {
    setSelectedCategory("");
  };

  return (
    <div className="bg-bookwise-blue text-white min-h-screen">
      <Navbar onHomePageClick={handleHomePageClick} />

      <div className="p-8">
        <div className="flex justify-between items-center mb-6 lg:gap-x-4 max-lg:flex-col max-lg:gap-y-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          {/* Use the AiPoweredSwitch component */}
          <AiPoweredSwitch aiPowered={aiPowered} setAiPowered={setAiPowered} />
        </div>

        {/* Display loading spinner while fetching data */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="border-t-4 border-b-4 border-blue-500 w-16 h-16 rounded-full animate-spin"></div>
          </div>
        ) : (
          // Display book cards
          <div className="flex flex-wrap gap-3 justify-center max-lg:w-full max-lg:items-center max-lg:justify-center max-lg:gap-y-4">
            {(aiPowered && selectedCategory && aiSuggestions.length > 0
              ? aiSuggestions
              : books
            ).map((book) => (
              <BookCard
                key={book.isbn13}
                book={book}
                userId={userId}
                likedBooks={likedBooks}
                isAiPowered={aiPowered && selectedCategory}
              />
            ))}
          </div>
        )}

        {/* Display pagination buttons if AI is not powered */}
        {!aiPowered && (
          <PaginationButtons
            page={page}
            nextPage={nextPage}
            prevPage={prevPage}
          />
        )}
      </div>
    </div>
  );
}

export default HomePage;
