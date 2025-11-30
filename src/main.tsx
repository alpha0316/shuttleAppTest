import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Screens/Home";
import BusStopDetails from './Screens/BusStopDetails';
import Tracker from './Screens/Tracker';
import { ClosestStopProvider } from "./Screens/ClosestStopContext";
import { ClosestBusProvider } from './Screens/useClosestBus';
import Auth from "./Screens/Auth";
import OTP from "./Screens/OTP";

// ===========================
// 🚨 TEMPORARY: BYPASS AUTH
// ===========================
// Set this to true to skip authentication
const BYPASS_AUTH = false;

// Authentication helper functions
const isAuthenticated = (): boolean => {
  // 🚨 TEMPORARY: Always return true when bypassing auth
  if (BYPASS_AUTH) {
    console.log('⚠️ AUTH BYPASS ACTIVE - Skipping authentication check');
    return true;
  }

  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  
  // Check if both token and user data exist
  if (!token || !userData) {
    return false;
  }

  try {
    // Optionally: Check if token is expired (if your tokens have expiration)
    // You can add more validation here if needed
    return true;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return false;
  }
};

// Protected Route Component - redirects to auth if not logged in
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Public Route Component - redirects to home if already logged in
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  if (isAuthenticated()) {
    return <Navigate to="/Home" replace />;
  }
  return <>{children}</>;
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <ClosestBusProvider>
    <ClosestStopProvider>
      <Router>
        <Routes>
          {/* Public routes - redirect to Home if already authenticated */}
          <Route 
            path="/" 
            element={
              BYPASS_AUTH ? <Navigate to="/Home" replace /> : (
                <PublicRoute>
                  <Auth />
                </PublicRoute>
              )
            } 
          />
          <Route 
            path="/OTP" 
            element={
              <PublicRoute>
                <OTP />
              </PublicRoute>
            } 
          />

          {/* Protected routes - require authentication */}
          <Route 
            path="/Home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/BusStopDetails/:id" 
            element={
              <ProtectedRoute>
                <BusStopDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/Tracker" 
            element={
              <ProtectedRoute>
                <Tracker />
              </ProtectedRoute>
            } 
          />

          {/* Catch all - redirect to appropriate page */}
          <Route 
            path="*" 
            element={
              isAuthenticated() ? <Navigate to="/Home" replace /> : <Navigate to="/" replace />
            } 
          />
        </Routes>
      </Router>
    </ClosestStopProvider>
  </ClosestBusProvider>
);

// ===========================
// 🚨 REMEMBER TO SET BYPASS_AUTH = false WHEN AUTH IS FIXED!
// ===========================