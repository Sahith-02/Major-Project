import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Lock, User, Mail, ArrowRight } from "lucide-react";
import "./Auth.css";

const Registration = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleStandardRegistration = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Basic validation
    if (!username || !email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        // Redirect to login or directly log in
        navigate("/login");
      }
    } catch (error) {
      // Handle specific error cases
      if (error.response) {
        setError(error.response.data.error || "Registration failed");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");

    try {
      // Add logging to debug the credential response
      console.log("Google credential response:", credentialResponse);
      
      const response = await axios.post("http://localhost:5000/auth/google", {
        credential: credentialResponse.credential,
        type: "register" // Add a type to differentiate registration
      });

      if (response.status === 200 || response.status === 201) {
        // Redirect to login page after successful registration
        navigate("/login");
      }
    } catch (error) {
      // Enhanced error logging
      console.error("Google registration error:", error);
      
      // Handle specific error cases
      if (error.response) {
        setError(error.response.data.error || "Google registration failed");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("Google login error:", error);
    setError("Google registration unsuccessful. Please try again.");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-background">
          <h1>Create Your Account</h1>
          <p>Join our platform and start your journey towards success</p>
        </div>
        <div className="auth-content">
          <div className="auth-content-wrapper">
            <div className="form-section">
              <h2>Sign Up</h2>

              {error && <p className="error">{error}</p>}

              <form onSubmit={handleStandardRegistration}>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="login-button" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Register"}
                  <ArrowRight className="button-icon" />
                </button>
              </form>
            </div>

            <div className="social-section">
              <div className="divider">
                <span>OR</span>
              </div>

              <div className="google-login-container">
                <GoogleOAuthProvider clientId="824084385888-siql0qspburqgcdvl03lb0dv2g9nshso.apps.googleusercontent.com">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleFailure}
                    useOneTap={false}
                    width="350"
                  />
                </GoogleOAuthProvider>
              </div>
            </div>
          </div>

          <p className="auth-link">
            Already have an account? <a href="/login">Login here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;