import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { parseQuestionsFromText } from "../parser.js";

// Use a bundled worker from pdfjs-dist
// Vite will handle this import path.
pdfjsLib.GlobalWorkerOptions.workerSrc =
  pdfjsLib.GlobalWorkerOptions.workerSrc ||
  new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).toString();

export default function UploadView({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File size must be 10 MB or less.");
      setFile(null);
      return;
    }
    setError("");
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }
    const totalSeconds = Number(hours) * 3600 + Number(minutes) * 60;
    if (!totalSeconds || totalSeconds <= 0) {
      setError("Please set a valid time limit.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // Read file into ArrayBuffer
      const buffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      // Load PDF with pdfjs in browser
      const loadingTask = pdfjsLib.getDocument({ data: uint8 });
      const pdfDoc = await loadingTask.promise;

      let fullText = "";
      const numPages = pdfDoc.numPages;
      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        const page = await pdfDoc.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join("\n");
        fullText += pageText + "\n";
      }

      const parsed = parseQuestionsFromText(fullText);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Could not parse questions from this PDF.");
      }

      onUploadSuccess(parsed, totalSeconds);
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Upload Test PDF & Set Time</h2>
      <p className="muted">
        Upload a PDF containing MCQ questions and options (max 10 MB). Then set
        your preferred time limit.
      </p>
      <form onSubmit={handleSubmit} className="form-grid">
        <label className="form-field">
          <span>Test PDF (max 10 MB)</span>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </label>

        <div className="form-field time-fields">
          <span>Time Limit</span>
          <div className="time-inputs">
            <label>
              Hours
              <input
                type="number"
                min="0"
                max="5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </label>
            <label>
              Minutes
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              />
            </label>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading} className="primary-btn">
          {loading ? "Processing PDF..." : "Start Test"}
        </button>
      </form>
    </section>
  );
}


