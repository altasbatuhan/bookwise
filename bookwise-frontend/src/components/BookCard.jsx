import React from "react";
import { Link } from "react-router-dom";
import LikeButton from "./LikeButton";

function BookCard({ book, likedBooks, onUpdateLikedBooks }) {
  // Accepts book data, liked books array, and a function to update liked books
  return (
    <div className="bg-bookwise-gray p-2 rounded-lg shadow-lg lg:max-w-[13rem] max-lg:w-full max-lg:mx-5 w-full relative opacity-90 hover:opacity-100">
      {/* Container for the book card with styling */}
      {/* Like button */}
      <div className="absolute top-2 right-2 p-1">
        {/* Position the like button at the top right */}
        <LikeButton
          isbn13={book.isbn13} // Pass the book's ISBN to the LikeButton
          likedBooks={likedBooks} // Pass the array of liked books
          onUpdateLikedBooks={onUpdateLikedBooks} // Pass the function to update liked books
        />
      </div>
      <img
        src={book.thumbnail} // Display the book's thumbnail image
        alt={book.title} // Set the alt text to the book's title
        className="w-full h-[300px] object-fit rounded-lg pointer-events-none"
      />
      <Link to={`/book/${book.isbn13}`}>
        {/* Link to the book's details page */}
        <h3 className="mt-2 text-xl font-semibold dark:hover:text-sky-400">
          {book.title}
        </h3>
      </Link>
      <p className="text-gray-400">
        {Array.isArray(book.authors)
          ? book.authors.map((author, index) => (
              <span key={index}>
                <a
                  href={`/author/${encodeURIComponent(author)}`}
                  className="text-gray-400 dark:hover:text-sky-600 "
                >
                  {author}
                </a>
                {index < book.authors.length - 1 && (
                  <span className="mx-1">, </span>
                )}
              </span>
            ))
          : (book.authors || "").split(";").map((author, index, authors) => (
              <span key={index}>
                <a
                  href={`/author/${encodeURIComponent(author.trim())}`}
                  className="text-gray-400 dark:hover:text-sky-600 "
                >
                  {author.trim()}
                </a>
                {index < authors.length - 1 && <span className="mx-1">, </span>}
              </span>
            ))}
      </p>

      {/* Display the book's authors */}
      <p className="mt-2 text-gray-300 line-clamp-3">{book.description}</p>
      {/* Display the book's description */}
    </div>
  );
}

export default BookCard;
