import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { InterviewProvider } from "./context/InterviewContext";
import { UserProvider } from "./context/UserContext"; // Import the new provider
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserProvider>
      <InterviewProvider>
        <App />
      </InterviewProvider>
    </UserProvider>
  </React.StrictMode>
);
