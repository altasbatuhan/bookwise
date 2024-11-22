import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import Navbar from "../components/Navbar";
import apiService from "../services/apiService";

function AuthorPage() {
  const { authorName } = useParams();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API call to get the author's books
  useEffect(() => {
    const fetchBooksByAuthor = async () => {
      try {
        // Get the ISBN13 numbers of the author's books
        const isbn13List = await apiService.getBooksByAuthor(authorName);

        // Get detailed information of the books by ISBN13
        const booksData = await Promise.all(
          isbn13List.map(async (isbn13) => {
            const book = await apiService.getBookByIsbn(isbn13);
            return book;
          })
        );

        // Save the books to the state
        setBooks(booksData);
      } catch (err) {
        setError(err.message); // Save error message to the state if there's an error
      } finally {
        setLoading(false); // Set loading to false when done loading
      }
    };

    fetchBooksByAuthor();
  }, [authorName]);

  if (loading) {
    return (
      <div className="bg-bookwise-blue text-white min-h-screen">
        <Navbar /> {/* Render the Navbar component */}
        {/* Loading spinner */}
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="border-t-4 border-b-4 border-blue-500 w-16 h-16 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bookwise-blue text-white min-h-screen">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <p className="text-center text-gray-400 text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bookwise-blue text-white min-h-screen">
      <Navbar /> {/* Render the Navbar component */}
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Books by {authorName}</h1>
        {books.length === 0 ? (
          // No books found for this author
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <p className="text-center text-gray-400 text-lg">
              No books found for this author.
            </p>
          </div>
        ) : (
          // Display books by author
          <div className="flex flex-wrap gap-3 justify-center">
            {books.map((book) => (
              <BookCard
                key={book.isbn13}
                book={book}
                likedBooks={[]} // You can use likedBooks and onUpdateLikedBooks props here
                onUpdateLikedBooks={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthorPage;
