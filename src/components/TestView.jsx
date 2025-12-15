import React, { useState } from "react";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function TestView({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
  remainingSeconds,
  totalSeconds,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (questionId, optionId) => {
    onAnswerChange(questionId, optionId);
  };

  const gotoPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const gotoNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  };

  if (!currentQuestion) {
    return (
      <section className="card">
        <p>No questions were parsed from this PDF.</p>
      </section>
    );
  }

  const selectedOptionId = answers[currentQuestion.id] || "";

  const typeLabel = (() => {
    switch (currentQuestion.type) {
      case "match":
        return "Match the following";
      case "assertion":
        return "Assertion / Reason";
      case "statement":
        return "Statement-based question";
      default:
        return "";
    }
  })();

  return (
    <section className="card test-view">
      <header className="test-header">
        <div>
          <h2>
            Question {currentIndex + 1} of {questions.length}
          </h2>
        </div>
        <div className="timer">
          <span>Total: {formatTime(totalSeconds)}</span>
          <span>Remaining: {formatTime(remainingSeconds)}</span>
        </div>
      </header>

      <div className="question-body">
        {typeLabel && <div className="question-tag">{typeLabel}</div>}
        <div className="question-text">{currentQuestion.text}</div>

        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="options-list">
            {currentQuestion.options.map((opt) => (
              <label
                key={opt.id}
                className={`option ${
                  selectedOptionId === opt.id ? "option-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name={`q-${currentQuestion.id}`}
                  value={opt.id}
                  checked={selectedOptionId === opt.id}
                  onChange={() => handleOptionSelect(currentQuestion.id, opt.id)}
                />
                <span className="option-label">{opt.label}.</span>
                <span>{opt.text}</span>
              </label>
            ))}
          </div>
        )}

        {/* Placeholder for future: show images, match-the-following, etc. */}
      </div>

      <footer className="test-footer">
        <div className="nav-buttons">
          <button onClick={gotoPrev} disabled={currentIndex === 0}>
            Previous
          </button>
          <button
            onClick={gotoNext}
            disabled={currentIndex === questions.length - 1}
          >
            Next
          </button>
        </div>
        <button className="primary-btn" onClick={onSubmit}>
          Submit Test
        </button>
      </footer>
    </section>
  );
}


