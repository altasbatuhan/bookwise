import { toast } from "react-toastify";
import qs from "qs";

const API_BASE_URL = "http://localhost:5005";

const apiService = {
  //USER OPERATIONS
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      return data; // Return success response if registration is successful
    } catch (error) {
      console.error("Register error:", error);
      throw error; // Rethrow error to be handled by the calling function
    }
  },

  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }

      return data; // Return user data if login is successful
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Rethrow error to be handled by the calling function
    }
  },

  // LOGOUT OPERATION
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Logout failed.");
      }

      return data; // Return success message if logout is successful
    } catch (error) {
      console.error("Logout error:", error);
      throw error; // Rethrow error to be handled by the calling function
    }
  },

  // DELETE USER OPERATION
  deleteUser: async (userId, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/delete-user/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }), // Send password for validation
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "User deletion failed.");
      }

      return data; // Return success message if deletion is successful
    } catch (error) {
      console.error("Delete user error:", error);
      throw error; // Rethrow error to be handled by the calling function
    }
  },

  // UPDATE USER OPERATION
  updateUser: async (userId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData), // Send the updated user data (username, email, old password, etc.)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "User update failed.");
      }

      return data; // Return success message and updated user data if update is successful
    } catch (error) {
      console.error("Update user error:", error);
      throw error; // Rethrow error to be handled by the calling function
    }
  },

  // GET list of books with optional pagination and category filtering
  getBooks: async (page = 1, limit = 50, category = "") => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/books?page=${page}&limit=${limit}&category=${category}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error fetching books.");
      }

      return data; // List of books with pagination and category filtering
    } catch (error) {
      console.error("Error fetching books:", error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  },
  // GET book details by ISBN13
  getBookByIsbn: async (isbn13) => {
    try {
      const response = await fetch(`${API_BASE_URL}/book/${isbn13}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Book not found.");
      }

      return data; // Book details like title, description, authors, etc.
    } catch (error) {
      console.error(`Error fetching book details for ISBN13: ${isbn13}`, error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  },

  // GET list of categories with the count of books in each category
  getCategoriesWithBookCount: async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/categories/with-book-count`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Error fetching categories with book count."
        );
      }

      return data; // List of categories with the book count in each category
    } catch (error) {
      console.error("Error fetching categories with book count:", error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  },

  // GET list of books liked by the user
  getLikedBooks: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/liked/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { liked_books: [] }; // Return an empty array if no liked books found
        } else {
          // For other errors, throw an error as before
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch liked books.");
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching liked books:", error);
      throw error;
    }
  },

  // Like a book (POST request)
  likeBook: async (userId, isbn13) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/liked/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isbn13 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to like the book.");
      }

      return data; // Return the success message for liking the book
    } catch (error) {
      console.error("Error liking the book:", error);
      throw error; // Rethrow error to be handled by the calling function
    }
  },

  deleteLike: async (userId, isbn13) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/liked/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isbn13 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete the book like.");
      }

      return data; // Return the success message for deleting the like
    } catch (error) {
      console.error("Error deleting the like:", error);
      throw error; // Rethrow error to be handled by the calling function
    }
  },

  getUserReviews: async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/books/review/user/${userId}`
      );
      const data = await response.json();

      if (!response.ok) {
        // Check if the error is specifically about no books/reviews found
        if (
          data.error === "No books found or no reviews available for this user"
        ) {
          return { reviews: [] }; // Return an empty array
        } else {
          // If it's a different error, re-throw it
          throw new Error(data.error || "Error fetching user reviews.");
        }
      }

      return data;
    } catch (error) {
      console.error("Error fetching user reviews:", error);
      throw error;
    }
  },
  // POST a new or updated book review for the user
  postBookReview: async (userId, isbn13, rating) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/books/review/user/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isbn13, rating }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error submitting the book review.");
      }

      return data; // The updated review information for the book
    } catch (error) {
      console.error("Error submitting book review:", error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  },
  // GET top 5 categories with the most books
  getTopCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/top-categories`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error fetching top categories.");
      }

      return data; // List of top categories with the book count
    } catch (error) {
      console.error("Error fetching top categories:", error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  },

  // GET all distinct categories available in the database
  getAllCategories: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/categories`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error fetching all categories.");
      }

      return data; // List of all categories
    } catch (error) {
      console.error("Error fetching all categories:", error);
      throw error; // Rethrow the error to be handled by the calling function
    }
  },

  // Get AI suggestions for a category
  getAISuggestions: async (userId, category) => {
    try {
      const query = qs.stringify({ category });
      const response = await fetch(
        `${API_BASE_URL}/api/ai-suggestions/${userId}?` + query
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error fetching AI suggestions.");
      }

      return data; // List of recommended books
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
      toast.error("Error fetching AI suggestions:", category);
      throw error; // Rethrow the error to be handled by the calling function
    }
  },
};

export default apiService;
