import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useInterview } from "../../context/InterviewContext";
import Button from "../ui/Button/Button";
import Lottie from "react-lottie";
import animationData from "./Animation-1739518929535.json";
import "./Interview.css";
import axios from "axios";
import EvaluationFeedback from "../EvaluationFeedback";
import { useUser } from "../../context/UserContext";

const InterviewPage = () => {
  const { currentUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const initialSubject = location.state?.subject;
  const initialDifficulty = location.state?.difficulty;

  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [subject, setSubject] = useState(initialSubject || "");
  const [roundNumber, setRoundNumber] = useState(1);
  const [difficulty, setDifficulty] = useState(initialDifficulty || "");
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [interviewState, setInterviewState] = useState({
    subject: initialSubject || "",
    difficulty: initialDifficulty || "",
    asked_questions: [],
    current_question_index: 0,
    current_subject: "",
    round_number: 1,
    question_number: 1,
    total_questions: 0,
    total_rounds: 0,
    completed_subjects: [],
  });

  const {
    currentQuestion,
    setCurrentQuestion,
    currentAnswer,
    setCurrentAnswer,
    evaluation,
    followupQuestions,
    setFollowupQuestions,
    currentFollowupIndex,
    setCurrentFollowupIndex,
    setEvaluation,
    setStep,
  } = useInterview();

  const [countdownValue, setCountdownValue] = useState(5);
  const countdownIntervalRef = useRef(null);
  const [askedQuestions, setAskedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const isNewInterviewRef = useRef(true);
  const recordingTimeoutRef = useRef(null);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const getLottieOptions = () => {
    return animationData ? {
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    } : null;
  };

  const initializeSpeechRecognition = () => {
    if (recognitionRef.current) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");
        setTranscription(transcript);
        setCurrentAnswer(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition is not supported in this browser.");
    }
  };

  const startRecording = () => {
    if (!recognitionRef.current) {
      initializeSpeechRecognition();
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            setIsRecording(true);
          } catch (err) {
            console.error("Error starting recognition:", err);
            setIsRecording(false);
          }
        }, 100);
      }
    } catch (error) {
      console.error("Recording error:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      } finally {
        setIsRecording(false);
      }
    }
  };

  const speakQuestion = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      speechSynthesisRef.current = null;

      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesisRef.current = utterance;

      utterance.onend = () => {
        setIsSpeaking(false);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        setCountdownValue(5);

        countdownIntervalRef.current = setInterval(() => {
          setCountdownValue((prev) => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              startRecording();
              return "Start";
            }
            return prev - 1;
          });
        }, 1000);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } else {
      console.warn("Text-to-speech is not supported in this browser.");
    }
  };

  useEffect(() => {
    if (!initialSubject || !initialDifficulty) {
      navigate("/interview");
      return;
    }

    initializeSpeechRecognition();

    return () => {
      stopRecording();

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        speechSynthesisRef.current = null;
      }

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log("Recognition cleanup error:", e);
        }
        recognitionRef.current = null;
      }
    };
  }, [initialSubject, initialDifficulty, navigate]);

  useEffect(() => {
    if (currentQuestion) {
      speakQuestion(currentQuestion);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        speechSynthesisRef.current = null;
      }
      setIsSpeaking(false);
    };
  }, [currentQuestion]);

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
    switch (subj.toLowerCase()) {
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

  const calculateProgress = () => {
    return (questionNumber / totalQuestions) * 100;
  };

  const startInterview = async () => {
    try {
      if (isNewInterviewRef.current) {
        setRoundNumber(1);
        setQuestionNumber(1);
        setInterviewState({
          subject: initialSubject || "",
          difficulty: initialDifficulty || "",
          asked_questions: [],
          current_question_index: 0,
          current_subject: "",
          round_number: 1,
          question_number: 1,
          total_questions: 0,
          total_rounds: 0,
          completed_subjects: [],
        });
        setAskedQuestions([]);
        isNewInterviewRef.current = false;
      }

      const response = await axios.post(
        "http://localhost:5000/start-interview",
        {
          subject,
          difficulty,
          asked_questions: [],
          interview_state: {
            ...interviewState,
            round_number: 1,
            question_number: 1,
            asked_questions: [],
          },
        }
      );

      if (response.data.complete) {
        setInterviewComplete(true);
        setStep("complete");
        return;
      }

      if (response.data.question) {
        setCurrentQuestion(response.data.question);
        setAskedQuestions([response.data.question]);
        setSubject(response.data.subject);
        setDifficulty(response.data.difficulty);
        setRoundNumber(response.data.round_number || 1);
        setQuestionNumber(response.data.question_number || 1);
        setTotalQuestions(response.data.total_questions);
        setTotalRounds(response.data.total_rounds);
        setInterviewState(
          response.data.interview_state || {
            ...interviewState,
            round_number: response.data.round_number || 1,
            question_number: response.data.question_number || 1,
          }
        );
        setFollowupQuestions([]);
        setCurrentFollowupIndex(0);
      } else {
        alert("No more questions available in this category.");
      }
    } catch (error) {
      console.error("Error starting the interview:", error);
      alert("An error occurred while starting the interview.");
    }
  };


  // const handleSubmitAnswer = async () => {
  //   if (!currentUser?.id) {
  //     alert("Please log in to submit answers");
  //     navigate("/login");
  //     return;
  //   }
  
  //   if (!currentAnswer.trim()) {
  //     alert("Please record an answer");
  //     return;
  //   }
  
  //   setLoading(true);
  //   stopRecording();
  
  //   try {
  //     const response = await axios.post(
  //       "http://localhost:5000/api/submit-answer",
  //       {
  //         user_id: currentUser.id,
  //         answer: currentAnswer,
  //         question: currentQuestion,
  //         difficulty,
  //         subject,
  //         interview_state: interviewState,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //         },
  //       }
  //     );
      
  //     const evaluationData = response.data.evaluation;
  //     console.log("Evaluation response:", evaluationData);
      
  //     const fullEvaluation = {
  //       score: evaluationData.score || "N/A",
  //       feedback: evaluationData.feedback || "No feedback available",
  //       weak_areas: Array.isArray(evaluationData.weak_areas) ? evaluationData.weak_areas : [],
  //       strong_areas: Array.isArray(evaluationData.strong_areas) ? evaluationData.strong_areas : []
  //     };
      
  //     setEvaluation(fullEvaluation);
  //     setFollowupQuestions(response.data.followup_questions || []);
  //     setInterviewState(response.data.interview_state || interviewState);
  //     setCurrentAnswer("");
  //     setTranscription("");

  //     // Move to next question after evaluation is shown
  //     const nextResponse = await axios.post(
  //       "http://localhost:5000/start-interview",
  //       {
  //         subject: subject,
  //         difficulty: difficulty,
  //         asked_questions: [...askedQuestions, currentQuestion],
  //         interview_state: response.data.interview_state || interviewState,
  //       }
  //     );

  //     if (nextResponse.data.complete) {
  //       setInterviewComplete(true);
  //       setStep("complete");
  //       return;
  //     }

  //     if (nextResponse.data.question) {
  //       setCurrentQuestion(nextResponse.data.question);
  //       setAskedQuestions([...askedQuestions, nextResponse.data.question]);
  //       setSubject(nextResponse.data.subject);
  //       setDifficulty(nextResponse.data.difficulty);
  //       setRoundNumber(nextResponse.data.round_number);
  //       setQuestionNumber(nextResponse.data.question_number);
  //       setTotalQuestions(nextResponse.data.total_questions);
  //       setTotalRounds(nextResponse.data.total_rounds);
  //       setInterviewState(nextResponse.data.interview_state || interviewState);
  //       setFollowupQuestions([]);
  //       setCurrentFollowupIndex(0);
  //       setEvaluation(null);
  //     } else {
  //       handleSubjectComplete();
  //     }
  
  //   } catch (error) {
  //     console.error("Submission error:", error);
  //     alert(error.response?.data?.error || "Failed to submit answer");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmitAnswer = async () => {
    if (!currentUser?.id) {
      alert("Please log in to submit answers");
      navigate("/login");
      return;
    }
  
    if (!currentAnswer.trim()) {
      alert("Please record an answer");
      return;
    }
  
    setLoading(true);
    stopRecording();
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/submit-answer",
        {
          user_id: currentUser.id,
          answer: currentAnswer,
          question: currentQuestion,
          difficulty,
          subject,
          interview_state: interviewState,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      
      const evaluationData = response.data.evaluation;
      console.log("Evaluation response:", evaluationData);
      
      const fullEvaluation = {
        score: evaluationData.score || "N/A",
        feedback: evaluationData.feedback || "No feedback available",
        weak_areas: Array.isArray(evaluationData.weak_areas) ? evaluationData.weak_areas : [],
        strong_areas: Array.isArray(evaluationData.strong_areas) ? evaluationData.strong_areas : []
      };
      
      setEvaluation(fullEvaluation);
      const newFollowups = response.data.followup_questions || [];
      setFollowupQuestions(newFollowups);
      setInterviewState(response.data.interview_state || interviewState);
      setCurrentAnswer("");
      setTranscription("");

      // If we have follow-ups, use them first
      if (newFollowups.length > 0 && questionNumber < totalQuestions) {
        const nextQuestion = newFollowups[0];
        setCurrentQuestion(nextQuestion);
        setAskedQuestions([...askedQuestions, nextQuestion]);
        setFollowupQuestions(newFollowups.slice(1));
        setQuestionNumber(questionNumber + 1);
      } 
      // Otherwise get next question from backend
      else {
        const nextResponse = await axios.post(
          "http://localhost:5000/start-interview",
          {
            subject: subject,
            difficulty: difficulty,
            asked_questions: [...askedQuestions, currentQuestion],
            interview_state: response.data.interview_state || interviewState,
          }
        );

        if (nextResponse.data.complete) {
          setInterviewComplete(true);
          setStep("complete");
          return;
        }

        if (nextResponse.data.question) {
          setCurrentQuestion(nextResponse.data.question);
          setAskedQuestions([...askedQuestions, nextResponse.data.question]);
          setSubject(nextResponse.data.subject);
          setDifficulty(nextResponse.data.difficulty);
          setRoundNumber(nextResponse.data.round_number);
          setQuestionNumber(nextResponse.data.question_number);
          setTotalQuestions(nextResponse.data.total_questions);
          setTotalRounds(nextResponse.data.total_rounds);
          setInterviewState(nextResponse.data.interview_state || interviewState);
          setFollowupQuestions([]);
          setCurrentFollowupIndex(0);
          setEvaluation(null);
        } else {
          handleSubjectComplete();
        }
      }
  
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.error || "Failed to submit answer");
    } finally {
      setLoading(false);
    }
};
  
  const handleSubjectComplete = async () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      let completedSubjects = [];
      const storedSubjects = localStorage.getItem("completedSubjects");
      if (storedSubjects) {
        completedSubjects = JSON.parse(storedSubjects);
      }

      if (!completedSubjects.includes(subject.toLowerCase())) {
        completedSubjects.push(subject.toLowerCase());
        localStorage.setItem(
          "completedSubjects",
          JSON.stringify(completedSubjects)
        );
      }

      // Check if all required subjects are completed
      const requiredSubjects = ['cpp', 'dbms', 'os'];
      const allCompleted = requiredSubjects.every(subj => 
        completedSubjects.includes(subj)
      );

      if (allCompleted) {
        localStorage.setItem("interviewCompleted", "true");
        navigate("/interview-completion", { replace: true });
        return;
      }

      // Reset state for next subject
      setCurrentQuestion("");
      setCurrentAnswer("");
      setEvaluation(null);
      setFollowupQuestions([]);
      setCurrentFollowupIndex(0);
      setAskedQuestions([]);
      setRoundNumber(1);
      setQuestionNumber(1);
      setInterviewState({
        subject: "",
        difficulty: "",
        asked_questions: [],
        current_question_index: 0,
        current_subject: "",
        round_number: 1,
        question_number: 1,
        total_questions: 0,
        total_rounds: 0,
        completed_subjects: [],
      });
      isNewInterviewRef.current = true;

      navigate("/interview", { replace: true });
    } catch (error) {
      console.error("Error completing subject:", error);
      navigate("/interview", { replace: true });
    }
  };



  if (!currentUser) {
    return (
      <div className="auth-required">
        <p>Please log in to access the interview</p>
        <Button onClick={() => navigate("/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="interview-container">
      <h1 className="title">Technical Interview</h1>

      {!interviewComplete && !currentQuestion && (
        <div className="start-section card-gradient">
          <h2>Ready to begin your {subject.toUpperCase()} interview?</h2>
          <div
            className="difficulty-badge"
            style={{ backgroundColor: getDifficultyColor(difficulty) }}
          >
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
          </div>
          <Button
            onClick={startInterview}
            className="start-button pulse-animation"
          >
            Start Interview
          </Button>
        </div>
      )}

      {!interviewComplete && currentQuestion && (
        <div className="info-dashboard">
          <div
            className="subject-card"
            style={{ borderColor: getDifficultyColor(difficulty) }}
          >
            <div className="subject-icon">{getSubjectIcon(subject)}</div>
            <div className="subject-name">
              {subject ? subject.toUpperCase() : "N/A"}
            </div>
            <div
              className="subject-badge"
              style={{ backgroundColor: getDifficultyColor(difficulty) }}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </div>
          </div>

          <div className="progress-container">
            <div className="progress-stats">
              <div className="stat-item">
                <div className="stat-label">Round</div>
                <div className="stat-value">
                  {roundNumber}
                  <span className="stat-total">/{totalRounds || "?"}</span>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Question</div>
                <div className="stat-value">
                  {questionNumber}
                  <span className="stat-total">/{totalQuestions || "?"}</span>
                </div>
              </div>
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{
                  width: `${calculateProgress()}%`,
                  backgroundColor: getDifficultyColor(difficulty),
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {interviewComplete && (
        <div className="complete-section">
          <h2>Interview Completed!</h2>
          <p>You have completed the {subject.toUpperCase()} interview.</p>
          <div className="button-group">
            <Button
              onClick={() => {
                if (window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                navigate("/interview", { replace: true });
              }}
              className="selection-button"
            >
              Select New Interview
            </Button>
            <Button
              onClick={() => {
                if (window.speechSynthesis) {
                  window.speechSynthesis.cancel();
                }
                navigate("/dashboard", { replace: true });
              }}
              className="home-button"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      )}

      {currentQuestion && !interviewComplete && (
        <div className="question-section">
          <h3>Question:</h3>
          <div className="question-box">
            {currentQuestion}
            {isSpeaking && animationData && (
              <div className="lottie-animation-container">
                <Lottie
                  options={getLottieOptions()}
                  height={300}
                  width={300}
                  isStopped={!isSpeaking}
                  isPaused={false}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {currentQuestion && !interviewComplete && (
        <div className="answer-section">
          <h3>Your Answer:</h3>
          <div className="recording-controls">
            {isRecording ? (
              <Button onClick={stopRecording} className="stop-button">
                Stop Recording
              </Button>
            ) : (
              <div className="recording-timer">
                {isSpeaking
                  ? "Listening to question..."
                  : countdownValue === "Start"
                  ? "Recording Started!"
                  : `Recording will start in ${countdownValue}...`}
              </div>
            )}
          </div>

          {transcription && (
            <div className="transcription-box">
              <h4>Your Answer:</h4>
              <p>{transcription}</p>
            </div>
          )}
        </div>
      )}

      {/* {evaluation && (
        <div className="evaluation-section">
          <EvaluationFeedback evaluation={evaluation} difficulty={difficulty} />
        </div>
      )} */}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing your answer...</p>
        </div>
      )}

      <div className="button-section">
        {currentQuestion && !interviewComplete && (
          <Button
            onClick={handleSubmitAnswer}
            disabled={!currentAnswer || loading}
            className="submit-button"
          >
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
};

export default InterviewPage;