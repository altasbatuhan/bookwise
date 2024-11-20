import React, { useEffect, useState } from "react";
import BookCard from "../components/BookCard";
import Navbar from "../components/Navbar";
import apiService from "../services/apiService"; // Import the apiService

function LikedBooksPage() {
  const [books, setBooks] = useState([]);
  const [userId] = useState(
    JSON.parse(sessionStorage.getItem("user"))?.user_id
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedBooks = async () => {
      if (userId) {
        try {
          // Use apiService to fetch liked books
          const likedBooksData = await apiService.getLikedBooks(userId);
          setBooks(likedBooksData.liked_books);
        } catch (error) {
          console.error("Error getting liked books:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLikedBooks();
  }, [userId]);

  const updateLikedBooks = (isbn13, liked) => {
    // Function to update the liked books state
    setBooks((prevBooks) => {
      if (liked) {
        // If liked, add the book to the state
        const newBook = { isbn13 };
        const isAlreadyLiked = prevBooks.some((book) => book.isbn13 === isbn13); // Check if already liked
        if (!isAlreadyLiked) {
          return [...prevBooks, newBook]; // Add the new book to the array
        } else {
          return prevBooks; // If already liked, return the previous state
        }
      } else {
        // If unliked, remove the book from the state
        return prevBooks.filter((book) => book.isbn13 !== isbn13); // Filter out the unliked book
      }
    });
  };

  return (
    <div className="bg-bookwise-blue text-white min-h-screen">
      {/* Container with styling */}
      <Navbar /> {/* Render the Navbar component */}
      <div className="p-8">
        {/* Content container */}
        <h1 className="text-3xl font-bold mb-6">Liked Books</h1> {/* Heading */}
        {loading ? (
          // Show loading spinner while loading
          <div className="flex justify-center items-center h-64">
            <div className="border-t-4 border-b-4 border-blue-500 w-16 h-16 rounded-full animate-spin"></div>
          </div>
        ) : books.length === 0 ? (
          // Show message when no liked books, center it both horizontally and vertically
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <p className="text-center text-gray-400 text-lg">
              You haven't liked any books yet. Start exploring and add some to
              your favorites!
            </p>
          </div>
        ) : (
          // Display liked books once loaded
          <div className="flex flex-wrap gap-3 justify-center">
            {/* Container for book cards */}
            {books.map((book) => (
              // Map over the liked books array
              <BookCard
                key={book.isbn13} // Unique key for each book card
                book={book} // Pass book data to the BookCard component
                userId={userId} // Pass user ID to the BookCard component
                likedBooks={books.map((book) => book.isbn13)} // Pass array of liked book ISBNs
                onUpdateLikedBooks={updateLikedBooks} // Pass the function to update liked books
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default LikedBooksPage;
