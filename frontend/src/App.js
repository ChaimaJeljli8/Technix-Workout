import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./tailwind.css";
import { useAuthStore } from "./hooks/useAuth";
import { useEffect } from "react";

import HomePageDisplay from "./pages/HomePageDisplay";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import EmailVerificationPage from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Toaster } from "react-hot-toast";
import UserProfile from "./pages/userProfile";
import ProgressPage from "./pages/progressPage";
import WorkoutsLibrary from "./pages/workoutsLibrary";
import AdminDashboard from "./pages/adminDashboard"; // Admin Dashboard Page
import AdminUsers from "./pages/AdminUsers";
import AdminWorkouts from "./pages/AdminWorkouts";
import AdminProfile from "./pages/AdminProfile";
import AdminFeatures from "./pages/AdminFeatures";
import AdminContactMessages from "./pages/AdminContactMessages";
function App() {
  const { user, isCheckingAuth, checkAuth,initializeAuth } = useAuthStore(); // Access user and isCheckingAuth

  useEffect(() => {
    initializeAuth();
    checkAuth(); // Check authentication on app load
  }, [checkAuth,initializeAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    ); // Show loading indicator while checking auth
  }

  return (
    <div className="App">
      <Router>
        <div className="pages w-full h-full">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={!user ? <HomePageDisplay /> : <Navigate to={user?.role === "admin" ? "/adminDashboard" : "/userHome"} />}
            />
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to={user?.role === "admin" ? "/adminDashboard" : "/userHome"} />}
            />
            <Route
              path="/signup"
              element={!user ? <Signup /> : <Navigate to={user?.role === "admin" ? "/adminDashboard" : "/userHome"} />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/userHome"
              element={user && user?.role !== "admin" ? <Home /> : <Navigate to="/" />}
            />
            <Route
              path="/verify-email"
              element={user && !user?.isVerified ? <EmailVerificationPage /> : <Navigate to={user?.role === "admin" ? "/adminDashboard" : "/userHome"} />}
            />
            <Route
              path="/profile"
              element={user ? <UserProfile /> : <Navigate to="/" />}
            />
            <Route
              path="/workouts-library"
              element={user ? <WorkoutsLibrary /> : <Navigate to="/" />}
            />
            <Route
              path="/progress"
              element={user ? <ProgressPage /> : <Navigate to="/" />}
            />

            {/* Admin Routes */}
            <Route
              path="/adminDashboard"
              element= {<AdminDashboard /> }
            />
            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />
            <Route
              path="/admin/workouts"
              element={<AdminWorkouts/>}
            />
            <Route
              path="/admin/profile"
              element={<AdminProfile />}
              
            />
            <Route
              path="/admin/contact-messages"
              element={<AdminContactMessages />}
            />
            <Route
              path="/admin/features"
              element={<AdminFeatures />}
              
            />


            {/* Catch-All Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      <Toaster />
    </div>
  );
}

export default App;
