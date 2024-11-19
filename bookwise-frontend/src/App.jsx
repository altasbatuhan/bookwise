import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HomePage from "./pages/HomePageTemp";
import DetailsPage from "./pages/DetailsPage";
import LikedBooksPage from "./pages/FavoritesPage";
import SettingsPage from "./pages/SettingsPage";
import Auth from "./components/Auth";
import AuthGuard from "./hocs/guard";

function App() {
  return (
    <BrowserRouter>
      {" "}
      {/* Set up the router */}
      <Routes>
        {" "}
        {/* Define the routes */}
        <Route path="/auth" element={<Auth />} />{" "}
        {/* Route for authentication */}
        <Route
          path="/" // Route for the home page
          element={
            <AuthGuard>
              {" "}
              {/* Protect the home page with AuthGuard */}
              <HomePage />
            </AuthGuard>
          }
        />
        <Route
          path="/book/:isbn13" // Route for book details
          element={
            <AuthGuard>
              {" "}
              {/* Protect the book details page with AuthGuard */}
              <DetailsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/favorites" // Route for liked books
          element={
            <AuthGuard>
              {" "}
              {/* Protect the liked books page with AuthGuard */}
              <LikedBooksPage />
            </AuthGuard>
          }
        />
        <Route
          path="/settings" // Route for settings page
          element={
            <AuthGuard>
              {" "}
              {/* Protect the settings page with AuthGuard */}
              <SettingsPage />
            </AuthGuard>
          }
        />
      </Routes>
      <ToastContainer position="bottom-right" stacked newestOnTop />
      {/* Configure ToastContainer for notifications */}
    </BrowserRouter>
  );
}

export default App;
