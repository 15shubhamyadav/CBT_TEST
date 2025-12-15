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
  const [markedForReview, setMarkedForReview] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (questionId, optionId) => {
    onAnswerChange(questionId, optionId);
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setMarkedForReview((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
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

  const isUrgent = remainingSeconds <= 600; // 10 minutes or less

  return (
    <>
      <section className="card test-view">
        <header className="test-header">
          <div>
            <h2>
              Question {currentIndex + 1} of {questions.length}
            </h2>
          </div>
          <div className="timer">
            <span>Total: {formatTime(totalSeconds)}</span>
            <span
              className={isUrgent ? "timer-remaining urgent" : "timer-remaining"}
            >
              Remaining: {formatTime(remainingSeconds)}
            </span>
          </div>
        </header>

        <div className="test-layout">
          <div className="test-main">
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
                        onChange={() =>
                          handleOptionSelect(currentQuestion.id, opt.id)
                        }
                      />
                      <span className="option-label">{opt.label}.</span>
                      <span>{opt.text}</span>
                    </label>
                  ))}
                </div>
              )}
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
              <div className="test-actions">
                <button
                  type="button"
                  className={`secondary-btn ${
                    markedForReview[currentQuestion.id] ? "active" : ""
                  }`}
                  onClick={toggleMarkForReview}
                >
                  Mark for Review
                </button>
                <button
                  className="primary-btn"
                  type="button"
                  onClick={() => setShowConfirm(true)}
                >
                  Submit Test
                </button>
              </div>
            </footer>
          </div>
        </div>

        {showConfirm && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Submit Test?</h3>
              <p>
                Are you sure you want to submit your test now? You still have{" "}
                <strong>{formatTime(remainingSeconds)}</strong> remaining.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => {
                    setShowConfirm(false);
                    onSubmit();
                  }}
                >
                  Yes, Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Floating question palette in extreme right corner */}
      <div className="palette-fab-wrapper">
        <button
          type="button"
          className="palette-fab"
          onClick={() => setPaletteOpen((v) => !v)}
        >
          Q
        </button>
        {paletteOpen && (
          <div className="question-palette-flyout">
            <div className="palette-header">
              <span>Questions</span>
              <button
                type="button"
                className="palette-close"
                onClick={() => setPaletteOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="palette-grid">
              {questions.map((q, index) => {
                const isCurrent = index === currentIndex;
                const isMarked = markedForReview[q.id];
                const isAnswered = Boolean(answers[q.id]);

                let statusClass = "palette-item";
                if (isMarked) statusClass += " palette-marked";
                else if (isAnswered) statusClass += " palette-answered";
                else statusClass += " palette-unanswered";
                if (isCurrent) statusClass += " palette-current";

                return (
                  <button
                    key={q.id || index}
                    type="button"
                    className={statusClass}
                    onClick={() => {
                      setCurrentIndex(index);
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="palette-legend">
              <span className="legend-dot answered" /> Answered
              <span className="legend-dot marked" /> Marked
              <span className="legend-dot unanswered" /> Unanswered
            </div>
          </div>
        )}
      </div>
    </>
  );
}


