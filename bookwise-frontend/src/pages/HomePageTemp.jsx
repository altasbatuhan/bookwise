import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import Navbar from "../components/Navbar";
import PaginationButtons from "../components/PaginationButtons";
import CategoryFilter from "../components/CategoryFilter";
import AiPoweredSwitch from "../components/AiPoweredSwitch";

function HomePage() {
  // State variables to manage books, pagination, loading state, categories,
  // selected category, user ID, liked books, AI suggestions, and AI power state.
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

  // Number of books to display per page
  const booksPerPage = 16;

  // useEffect hook to fetch user data (liked books) when the component mounts
  // or when the selectedCategory or userId changes.
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const likedBooksResponse = await fetch(
          `http://localhost:5000/books/liked/${userId}`
        );

        if (likedBooksResponse.ok) {
          const likedBooksData = await likedBooksResponse.json();
          setLikedBooks(likedBooksData.liked_books.map((book) => book.isbn13));
        } else {
          console.error(
            "Error fetching liked books:",
            likedBooksResponse.status
          );
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [selectedCategory, userId]);

  // useEffect hook to fetch categories when the component mounts.
  useEffect(() => {
    fetch("http://localhost:5000/categories/with-book-count")
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // useEffect hook to fetch books or AI suggestions when the page,
  // selectedCategory, or aiPowered state changes.
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const categoryQuery = selectedCategory
        ? `&category=${selectedCategory}`
        : "";
      try {
        let response;
        if (aiPowered && selectedCategory) {
          // Fetch AI suggestions if AI is powered and a category is selected
          response = await fetch(
            `http://localhost:5000/api/ai-suggestions?category=${selectedCategory}`
          );
          const data = await response.json();
          // Format the data to be compatible with the BookCard component
          const formattedData = data.map((item) => ({
            ...item,
            title: item.title || "",
            authors: item.authors || [],
            categories: item.categories || [],
            thumbnail: item.thumbnail || "",
            description: item.description || "",
            published_year: item.published_year || 2023,
            average_rating: item.average_rating || 0,
            num_pages: item.num_pages || 300,
            ratings_count: item.ratings_count || 0,
          }));
          setAiSuggestions(formattedData);
        } else if (selectedCategory) {
          // Fetch books for the selected category
          response = await fetch(
            `http://localhost:5000/books?page=${page}&limit=${booksPerPage}${categoryQuery}`
          );
          setBooks(await response.json());
        } else {
          // Fetch all books if no category is selected
          response = await fetch(
            `http://localhost:5000/books?page=${page}&limit=${booksPerPage}`
          );
          setBooks(await response.json());
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
