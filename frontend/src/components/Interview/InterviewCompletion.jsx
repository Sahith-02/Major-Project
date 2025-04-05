import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import Button from "../ui/Button/Button";
import Lottie from "react-lottie";
import successAnimation from "./success-animation.json";
import "./InterviewCompletion.css";
import axios from "axios";
import SubjectDetailsDialog  from "./SubjectDetailsDialog.jsx";

const getDifficultyColor = (diff) => {
  switch (diff) {
    case "easy":
      return "#28a745";
    case "medium":
      return "#fd7e14";
    case "hard":
      return "#dc3545";
    default:
      return "#6c757d";
  }
};

const getSubjectIcon = (subj) => {
  switch (subj?.toLowerCase()) {
    case "cpp":
      return "💻";
    case "dbms":
      return "🗄️";
    case "os":
      return "⚙️";
    default:
      return "📚";
  }
};

const getPerformanceLevel = (score) => {
  if (score >= 90) return { level: "Excellent", color: "#28a745" };
  if (score >= 80) return { level: "Good", color: "#17a2b8" };
  if (score >= 70) return { level: "Satisfactory", color: "#fd7e14" };
  return { level: "Needs Improvement", color: "#dc3545" };
};

const InterviewCompletion = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [showCertificate, setShowCertificate] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: successAnimation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    const verifyTokenAndFetchData = async () => {
      try {
        // First verify token
        const token = localStorage.getItem("access_token");
        if (!token) {
          throw new Error("No access token found");
        }

        // Then check completion status
        const completionStatus = localStorage.getItem("interviewCompleted");
        if (completionStatus !== "true") {
          navigate("/interview", { replace: true });
          return;
        }

        // Get completed subjects safely
        const storedSubjects = localStorage.getItem("completedSubjects");
        const completedSubjects = storedSubjects
          ? JSON.parse(storedSubjects)
          : [];

        // Check if all required subjects are completed
        const requiredSubjects = ["cpp", "dbms", "os"];
        const allCompleted = requiredSubjects.every(
          (subj) => completedSubjects?.includes?.(subj) || false
        );

        if (!allCompleted) {
          navigate("/interview", { replace: true });
          return;
        }

        // Finally fetch evaluations
        const response = await axios.get(
          "http://localhost:5000/api/user-evaluations",
          {
            params: { user_id: currentUser?.id,
              include_question: true,
             },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.success) {
          setEvaluations(response.data.evaluations || []);
        } else {
          throw new Error(
            response.data?.error || "Failed to fetch evaluations"
          );
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        console.error("Error:", err);

        // If token is invalid, redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("interviewCompleted");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyTokenAndFetchData();
  }, [navigate, currentUser]);

  const calculateOverallScore = () => {
    if (!evaluations || evaluations.length === 0) return 0;

    const total = evaluations.reduce((sum, evaluation) => {
      // Handle different score formats safely
      const scoreStr = evaluation?.score || "0";
      let scoreValue;

      if (typeof scoreStr === "string") {
        if (scoreStr.includes("/")) {
          const [numerator, denominator] = scoreStr.split("/").map(Number);
          scoreValue = denominator !== 0 ? (numerator / denominator) * 100 : 0;
        } else if (scoreStr.includes("%")) {
          scoreValue = parseFloat(scoreStr) || 0;
        } else {
          scoreValue = parseFloat(scoreStr) || 0;
        }
      } else if (typeof scoreStr === "number") {
        scoreValue = scoreStr;
      } else {
        scoreValue = 0;
      }

      return sum + scoreValue;
    }, 0);

    return evaluations.length > 0 ? Math.round(total / evaluations.length) : 0;
  };

  const overallScore = calculateOverallScore();
  const performance = getPerformanceLevel(overallScore);

  const handleReturnToDashboard = () => {
    localStorage.removeItem("interviewCompleted");
    localStorage.removeItem("completedSubjects");
    navigate("/dashboard", { replace: true });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Results</h2>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
        <Button onClick={handleReturnToDashboard} className="dashboard-button">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="interview-completion-container">
      <div className="completion-header">
        <h1>Interview Program Completed</h1>
        <div className="animation-container">
          <Lottie options={defaultOptions} height={150} width={150} />
        </div>
      </div>

      <div className="completion-summary">
        <div className="score-card">
          <div
            className="score-circle"
            style={{ borderColor: performance.color }}
          >
            <span>{overallScore}</span>
          </div>
          <div
            className="performance-level"
            style={{ color: performance.color }}
          >
            {performance.level}
          </div>
        </div>

        <div className="summary-stats">
          <h2>Your Technical Interview Journey</h2>
          {evaluations?.length > 0 ? (
            <>
              <p>
                You've successfully completed all technical interview subjects!
              </p>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-icon">🎯</div>
                  <div className="stat-value">
                    {new Set(evaluations.map((e) => e?.subject)).size}
                  </div>
                  <div className="stat-label">Subjects Completed</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-value">{evaluations.length}</div>
                  <div className="stat-label">Total Questions</div>
                </div>
                <div className="stat-item">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-value">{overallScore}%</div>
                  <div className="stat-label">Average Score</div>
                </div>
              </div>
            </>
          ) : (
            <p>
              No evaluation data found. Please complete some interviews first.
            </p>
          )}
        </div>
      </div>

      {evaluations?.length > 0 && (
        <div className="interview-results">
          <h2>Subject Performance</h2>
          <div className="results-grid">
            {Array.from(new Set(evaluations.map((e) => e?.subject)))?.map(
              (subject, index) => {
                const subjectEvals = evaluations.filter(
                  (e) => e?.subject === subject
                );
                const subjectScore = Math.round(
                  subjectEvals.reduce((sum, evaluation) => {
                    const scoreStr = evaluation?.score || "0";
                    let scoreValue;

                    if (typeof scoreStr === "string") {
                      if (scoreStr.includes("/")) {
                        const [numerator, denominator] = scoreStr
                          .split("/")
                          .map(Number);
                        scoreValue =
                          denominator !== 0
                            ? (numerator / denominator) * 100
                            : 0;
                      } else if (scoreStr.includes("%")) {
                        scoreValue = parseFloat(scoreStr) || 0;
                      } else {
                        scoreValue = parseFloat(scoreStr) || 0;
                      }
                    } else if (typeof scoreStr === "number") {
                      scoreValue = scoreStr;
                    } else {
                      scoreValue = 0;
                    }

                    return sum + scoreValue;
                  }, 0) / subjectEvals.length
                );

                return (
                  <div className="result-card" key={index}
                  onClick={() => {
                    setSelectedSubject({
                      subject,
                      difficulty: subjectEvals[0]?.difficulty,
                      evaluations: subjectEvals.map(evaluations => ({
                        ...evaluations,
                        question: evaluations.question // Ensure question is included
                      })),
                    });
                  }}
                  >
                    <div
                      className="result-header"
                      style={{
                        backgroundColor: getDifficultyColor(
                          subjectEvals[0]?.difficulty
                        ),
                      }}
                    >
                      <div className="subject-icon">
                        {getSubjectIcon(subject)}
                      </div>
                      <div className="subject-name">
                        {subject?.toUpperCase() || "N/A"}
                      </div>
                    </div>
                    <div className="result-details">
                      <div className="detail-item">
                        <span className="detail-label">Difficulty:</span>
                        <span className="detail-value">
                          {subjectEvals[0]?.difficulty
                            ?.charAt(0)
                            ?.toUpperCase() +
                            subjectEvals[0]?.difficulty?.slice(1) || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Score:</span>
                        <span className="detail-value">{subjectScore}%</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Questions:</span>
                        <span className="detail-value">
                          {subjectEvals.length}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {showCertificate ? (
        <div className="certificate-section">
          <div className="certificate">
            <div className="certificate-header">
              <h2>Certificate of Completion</h2>
              <div className="certificate-logo">🏆</div>
            </div>
            <div className="certificate-body">
              <p>This certifies that</p>
              <p className="certificate-name">
                {currentUser?.username || "Participant"}
              </p>
              <p>has successfully completed the</p>
              <p className="certificate-course">Technical Interview Program</p>
              <p>
                with an overall score of <strong>{overallScore}%</strong>
              </p>
              <div className="certificate-date">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowCertificate(false)}
            className="certificate-button"
          >
            Back to Summary
          </Button>
        </div>
      ) : (
        <div className="completion-actions">
          <Button
            onClick={() => setShowCertificate(true)}
            className="certificate-button"
          >
            View Certificate
          </Button>
          <Button
            onClick={handleReturnToDashboard}
            className="dashboard-button"
          >
            Return to Dashboard
          </Button>
        </div>
      )}
      {selectedSubject && (
        <SubjectDetailsDialog
          subjectData={selectedSubject}
          onClose={() => setSelectedSubject(null)}
        />
      )}
    </div>
  );
};

export default InterviewCompletion;
