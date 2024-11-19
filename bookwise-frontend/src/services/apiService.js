const API_BASE_URL = "http://localhost:5000";

const apiService = {
  //USER OPERATIONS
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return response.json();
  },
  deleteUser: async (userId, password) => {
    const response = await fetch(`${API_BASE_URL}/delete-user/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    return response.json();
  },
  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/update-user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // BOOK OPERATIONS
  getBooks: async (page = 1, limit = 50, category = "") => {
    const response = await fetch(
      `${API_BASE_URL}/books?page=${page}&limit=${limit}&category=${category}`
    );
    return response.json();
  },
  getBookByISBN: async (isbn13) => {
    const response = await fetch(`${API_BASE_URL}/book/${isbn13}`);
    return response.json();
  },
  getCategoriesWithBookCount: async () => {
    const response = await fetch(`${API_BASE_URL}/categories/with-book-count`);
    return response.json();
  },
  getLikedBooks: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/books/liked/${userId}`);
    return response.json();
  },
  likeBook: async (userId, isbn13) => {
    const response = await fetch(`${API_BASE_URL}/books/liked/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isbn13 }),
    });
    return response.json();
  },
  unlikeBook: async (userId, isbn13) => {
    const response = await fetch(`${API_BASE_URL}/books/liked/${userId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isbn13 }),
    });
    return response.json();
  },
  getReviewsByUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/books/review/user/${userId}`);
    return response.json();
  },
  submitReview: async (userId, isbn13, rating) => {
    const response = await fetch(
      `${API_BASE_URL}/books/review/user/${userId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isbn13, rating }),
      }
    );
    return response.json();
  },
  getTopCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/books/top-categories`);
    return response.json();
  },
  getAllCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/books/categories`);
    return response.json();
  },
  getAiSuggestions: async (category = "") => {
    const response = await fetch(
      `${API_BASE_URL}/api/ai-suggestions?category=${category}`
    );
    return response.json();
  },
  getRecommendations: async () => {
    const response = await fetch(`${API_BASE_URL}/books/recommendations`);
    return response.json();
  },
};

export default apiService;
