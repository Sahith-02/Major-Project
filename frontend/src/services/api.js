import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (unauthorized) and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/refresh-token`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${
                localStorage.getItem("refresh_token") ||
                localStorage.getItem("access_token")
              }`,
            },
          }
        );

        const newToken = refreshResponse.data.access_token;
        localStorage.setItem("access_token", newToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear token and redirect to login
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const loginUser = async (username, password) => {
  try {
    const response = await api.post("/login", { username, password });
    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      // Store refresh token if available
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }
    }
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const googleLogin = async (credential) => {
  try {
    console.log(
      "Sending Google credential to server:",
      credential.substring(0, 20) + "..."
    );

    // Make sure we're sending just the credential, not a complex object
    const response = await api.post("/auth/google", {
      credential,
      type: "login", // Specify this is a login attempt
    });

    console.log("Google login response:", response.data);

    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
      // Store refresh token if available
      if (response.data.refresh_token) {
        localStorage.setItem("refresh_token", response.data.refresh_token);
      }
    }
    return response.data;
  } catch (error) {
    console.error("Google login error:", error.response?.data || error.message);
    throw error;
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await api.post("/register", { username, email, password });
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const startInterview = async (subject, difficulty, askedQuestions) => {
  try {
    const response = await api.post("/start-interview", {
      subject,
      difficulty,
      asked_questions: askedQuestions,
    });
    return response.data;
  } catch (error) {
    console.error("Error starting the interview:", error);
    throw error;
  }
};

export const submitAnswer = async (
  answer,
  question,
  askedQuestions,
  userId
) => {
  try {
    const response = await api.post("/submit-answer", {
      answer,
      question,
      asked_questions: askedQuestions,
      user_id: userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting the answer:", error);
    throw error;
  }
};

export const storeEvaluation = async (
  userId,
  subject,
  difficulty,
  score,
  feedback,
  weakAreas,
  strongAreas
) => {
  try {
    const response = await api.post("/store-evaluation", {
      user_id: userId,
      subject,
      difficulty,
      score,
      feedback,
      weak_areas: weakAreas,
      strong_areas: strongAreas,
    });
    return response.data;
  } catch (error) {
    console.error("Error storing evaluation:", error);
    throw error;
  }
};

// Add verifyToken function
export const verifyToken = async (token) => {
  try {
    const response = await api.get("/api/verify-token", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Token verification error:", error);
    throw error;
  }
};

// Add refreshToken function
export const refreshToken = async () => {
  try {
    const response = await api.post("/api/refresh-token");
    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
    }
    return response.data;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
};

export default api;
