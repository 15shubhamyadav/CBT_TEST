import React from "react";

export default function ReviewView({ questions, answers, onRestart }) {
  return (
    <section className="card review-card">
      <header className="review-header">
        <h2>Review Your Responses</h2>
        <p className="muted">
          These are <strong>your marked answers</strong>. The system does not
          mark them as correct or incorrect. Please verify using the original
          PDF or answer key.
        </p>
      </header>

      <ol className="review-list">
        {questions.map((q, index) => {
          const selectedOptionId = answers[q.id];
          const selectedOption = q.options?.find(
            (opt) => opt.id === selectedOptionId
          );
          return (
            <li key={q.id || index} className="review-item">
              <div className="review-question">
                <span className="review-q-index">{index + 1}.</span>
                <span>{q.text}</span>
              </div>
              <div className="review-answer">
                <span className="review-answer-label">Your answer:</span>
                {selectedOption ? (
                  <span>
                    {selectedOption.label}. {selectedOption.text}
                  </span>
                ) : (
                  <span className="muted">(Not answered)</span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="review-footer">
        <button className="primary-btn" onClick={onRestart}>
          Start New Test
        </button>
      </footer>
    </section>
  );
}


