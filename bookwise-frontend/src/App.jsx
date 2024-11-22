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
import AuthorPage from "./pages/AuthorPage";

function App() {
  return (
    <BrowserRouter>
      {/* Set up the router */}
      <Routes>
        {/* Define the routes */}
        <Route path="/auth" element={<Auth />} />{" "}
        {/* Route for authentication */}
        {/* Home page route with AuthGuard */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <HomePage />
            </AuthGuard>
          }
        />
        {/* Book details page route with AuthGuard */}
        <Route
          path="/book/:isbn13"
          element={
            <AuthGuard>
              <DetailsPage />
            </AuthGuard>
          }
        />
        {/* Liked books page route with AuthGuard */}
        <Route
          path="/favorites"
          element={
            <AuthGuard>
              <LikedBooksPage />
            </AuthGuard>
          }
        />
        {/* Settings page route with AuthGuard */}
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <SettingsPage />
            </AuthGuard>
          }
        />
        {/* New route for author page, showing books by author */}
        <Route
          path="/author/:authorName"
          element={
            <AuthGuard>
              <AuthorPage />
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
