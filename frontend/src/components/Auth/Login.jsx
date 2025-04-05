import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Lock, User, ArrowRight } from "lucide-react";
import "./Auth.css";
import { useUser } from "../../context/UserContext";
import { loginUser, googleLogin } from "../../services/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();

  const clearInterviewData = () => {
    localStorage.removeItem("interviewCompleted");
    localStorage.removeItem("completedSubjects");
    localStorage.removeItem("currentInterview");
    localStorage.removeItem("interviewProgress");
  };

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await loginUser(username, password);

      if (response.access_token) {
        localStorage.setItem("access_token", response.access_token);
        // Set user in context
        setCurrentUser({
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
        });
        clearInterviewData();
        navigate("/interview");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.error || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Google credential received:", credentialResponse.credential);
      const response = await googleLogin(credentialResponse.credential);

      if (response.access_token) {
        localStorage.setItem("access_token", response.access_token);
        // Set user in context
        setCurrentUser({
          id: response.user.id,
          username: response.user.username,
          email: response.user.email,
        });
        clearInterviewData();
        navigate("/interview");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError(
        error.response?.data?.error || "Google login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    console.error("Google login failed");
    setError("Google login unsuccessful. Please try again.");
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-background">
          <h1>Welcome Back</h1>
          <p>Unlock a world of opportunities by logging into your account</p>
        </div>
        <div className="auth-content">
          <div className="auth-content-wrapper">
            <div className="form-section">
              <h2>Login</h2>

              {error && <p className="error">{error}</p>}

              <form onSubmit={handleStandardLogin}>
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
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="login-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                  <ArrowRight className="button-icon" size={18} />
                </button>
              </form>
            </div>

            <div className="social-section">
              <div className="divider">
                <span>OR</span>
              </div>

              <div className="google-login-container">
                <GoogleLogin
                  clientId="824084385888-siql0qspburqgcdvl03lb0dv2g9nshso.apps.googleusercontent.com"
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap={false}
                  width="350"
                  cookiePolicy={"single_host_origin"}
                />
              </div>
            </div>
          </div>

          <p className="auth-link">
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
