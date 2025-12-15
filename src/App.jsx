import React, { useState, useEffect } from "react";
import UploadView from "./components/UploadView.jsx";
import TestView from "./components/TestView.jsx";
import ReviewView from "./components/ReviewView.jsx";

const VIEWS = {
  UPLOAD: "upload",
  TEST: "test",
  REVIEW: "review",
};

export default function App() {
  const [view, setView] = useState(VIEWS.UPLOAD);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: optionId }
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!timerRunning || remainingSeconds <= 0 || view !== VIEWS.TEST) return;
    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          // Auto-submit when time is over
          setTimerRunning(false);
          setView(VIEWS.REVIEW);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, remainingSeconds, view]);

  const handleUploadSuccess = (parsedData, totalSeconds) => {
    const qs = parsedData?.questions || [];
    setQuestions(qs);
    setAnswers({});
    setTimeLimitSeconds(totalSeconds);
    setRemainingSeconds(totalSeconds);
    setView(VIEWS.TEST);
    setTimerRunning(true);
  };

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmitTest = () => {
    setTimerRunning(false);
    setView(VIEWS.REVIEW);
  };

  const handleRestart = () => {
    setView(VIEWS.UPLOAD);
    setQuestions([]);
    setAnswers({});
    setTimeLimitSeconds(0);
    setRemainingSeconds(0);
    setTimerRunning(false);
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <h1>PDF to CBT Test</h1>
          <p className="app-subtitle">
            Hey There! This is just a very lightweight website made by{" "}
            <strong>Shubham Yadav</strong>. It aims to convert test PDFs into a
            CBT-style test for better interaction, efficiency and practice.
            <br />
            <span className="app-note">
              Note: Answers are not provided; please match them manually from
              the answer key. One more thing – image-based questions cannot be
              extracted, so any figures or diagrams will not appear in the CBT
              view for those questions.
            </span>
          </p>
        </div>
      </header>
      <main className="app-main">
        {view === VIEWS.UPLOAD && (
          <UploadView onUploadSuccess={handleUploadSuccess} />
        )}
        {view === VIEWS.TEST && (
          <TestView
            questions={questions}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmitTest}
            remainingSeconds={remainingSeconds}
            totalSeconds={timeLimitSeconds}
          />
        )}
        {view === VIEWS.REVIEW && (
          <ReviewView
            questions={questions}
            answers={answers}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}


