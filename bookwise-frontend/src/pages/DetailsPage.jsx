import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StarRating from "../components/AverageRatings";
import Navbar from "../components/Navbar";
import LikeButton from "../components/LikeButton";
import RatingStars from "../components/RatingStars";
import apiService from "../services/apiService"; // Import the apiService

function DetailsPage() {
  const { isbn13 } = useParams();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedBooks, setLikedBooks] = useState([]);
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const userId = JSON.parse(sessionStorage.getItem("user"))?.user_id;

        // Use apiService to fetch book details
        const detailsData = await apiService.getBookByIsbn(isbn13);
        setBook(detailsData);

        // Use apiService to fetch user reviews
        const reviewData = await apiService.getUserReviews(userId);
        const userReview = reviewData.reviews.find(
          (review) => review.isbn13 === isbn13
        );
        setUserRating(userReview ? userReview.user_rating : 0);
      } catch (e) {
        console.error("Error fetching book:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [isbn13]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = JSON.parse(sessionStorage.getItem("user"))?.user_id;
        if (userId) {
          // Use apiService to fetch liked books
          const likedBooksData = await apiService.getLikedBooks(userId);
          setLikedBooks(likedBooksData.liked_books.map((book) => book.isbn13));
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleRatingChange = async (isbn13, newRating) => {
    try {
      const userId = JSON.parse(sessionStorage.getItem("user"))?.user_id;

      // Use apiService to post the book review
      await apiService.postBookReview(userId, isbn13, newRating);

      // Update the user rating state after successful rating
      const reviewData = await apiService.getUserReviews(userId);
      const updatedUserRating = reviewData.reviews.find(
        (review) => review.isbn13 === isbn13
      )?.user_rating;
      setUserRating(updatedUserRating || 0);
    } catch (error) {
      console.error("An error occurred while rating the book:", error);
    }
  };

  if (isLoading)
    return (
      // Show loading spinner while loading
      <div className="flex justify-center items-center h-64">
        <div className="border-t-4 border-b-4 border-blue-500 w-16 h-16 rounded-full animate-spin"></div>
      </div>
    );
  if (error)
    return <p className="text-center text-white">Error: {error.message}</p>;

  return (
    <div>
      <Navbar />
      <div className="p-8 bg-bookwise-blue min-h-screen text-white">
        <div className="px-72 flex justify-center">
          <div className="flex flex-col md:flex-row">
            <img
              className="w-[400px] h-[600px] rounded-lg mb-4 md:mr-8"
              src={book.thumbnail}
              alt={book.title}
            />
            <div className=" relative">
              <div className="flex-col items-center mb-4">
                <div className="flex flex-row justify-between items-center">
                  <h1 className="text-4xl font-bold">{book.title}</h1>
                  <div className="flex justify-end items-end mt-1">
                    <LikeButton isbn13={book.isbn13} likedBooks={likedBooks} />
                  </div>
                </div>
                <div className="flex">
                  <StarRating rating={book.average_rating} />
                  <div className="flex"></div>
                  <span className="ml-2 text-lg">{book.average_rating}</span>
                  <span className="ml-2 text-lg">({book.ratings_count})</span>
                </div>
              </div>
              {book.subtitle && (
                <h2 className="text-2xl font-semibold mb-4">{book.subtitle}</h2>
              )}
              <div className="absolute top-0 right-0"></div>
              <p className="mb-4">{book.description}</p>
              <p>
                <strong>Authors:</strong>{" "}
                {Array.isArray(book.authors)
                  ? book.authors.join(", ").replaceAll(";", ", ")
                  : (book.authors || "").replaceAll(";", ", ")}
              </p>
              <p>
                <strong>Categories:</strong> {book.categories}
              </p>
              <p>
                <strong>Published Year:</strong> {book.published_year}
              </p>
              <p>
                <strong>Pages:</strong> {book.num_pages}
              </p>
              <p>
                <strong>Average Rating:</strong> {book.average_rating}
              </p>
              <p>
                <strong>Ratings Count:</strong> {book.ratings_count}
              </p>
              <p>
                <strong>ISBN13:</strong> {book.isbn13}
              </p>

              <div className="mt-6">
                <h3 className="text-2xl font-bold mb-2">Rate this book:</h3>
                <RatingStars
                  isbn13={isbn13}
                  initialRating={userRating}
                  onRatingChange={handleRatingChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailsPage;
