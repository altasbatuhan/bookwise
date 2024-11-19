import React, { useState } from "react";
import { Navigate } from "react-router-dom";

const AuthGuard = (props) => {
  // This component acts as a guard for routes that require authentication

  const [session] = useState(() => sessionStorage.getItem("user"));
  // Get user session data from session storage

  // Conditionally render children or redirect to /auth
  return <>{session ? props.children : <Navigate to="/auth" />}</>;
  // If a session exists, render the children (protected content)
  // Otherwise, redirect to the /auth route
};

export default AuthGuard;
