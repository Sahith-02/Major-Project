import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { verifyToken } from "./services/api";
import Login from "./components/Auth/Login";
import Registration from "./components/Auth/Registration";
import Interview from "./components/Interview/Interview";
import InterviewPage from "./components/Interview/InterviewPage";
import { InterviewProvider } from "./context/InterviewContext";
import InterviewCompletion from "./components/Interview/InterviewCompletion";
import LandingPage from "./components/Auth/LandingPage";
import { UserProvider, useUser } from "./context/UserContext";

// Main App component without hooks
function App() {
  // Replace with your actual Google Client ID from Google Cloud Console
  const GOOGLE_CLIENT_ID =
    process.env.REACT_APP_GOOGLE_CLIENT_ID ||
    "824084385888-siql0qspburqgcdvl03lb0dv2g9nshso.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <UserProvider>
        <Router>
          <AppRoutes />
        </Router>
      </UserProvider>
    </GoogleOAuthProvider>
  );
}

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useUser();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated, preserving the intended destination
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public routes - only accessible when NOT logged in
const PublicRoute = ({ children }) => {
  const { currentUser, isLoading } = useUser();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to home if already authenticated
  if (currentUser) {
    const destination = location.state?.from?.pathname || "/interview";
    return <Navigate to={destination} replace />;
  }

  return children;
};

// Separate component for routes that can use router hooks
function AppRoutes() {
  const navigate = useNavigate();
  const { currentUser, isLoading } = useUser();

  return (
    <InterviewProvider>
      <Routes>
        {/* Public routes - accessible without login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Registration />
            </PublicRoute>
          }
        />
        <Route path="/home" element={<LandingPage />} />

        {/* Protected routes - require authentication */}
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Interview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-page"
          element={
            <ProtectedRoute>
              <InterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-completion"
          element={
            <ProtectedRoute>
              <InterviewCompletion />
            </ProtectedRoute>
          }
        />

        {/* Default routes */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </InterviewProvider>
  );
}

export default App;
