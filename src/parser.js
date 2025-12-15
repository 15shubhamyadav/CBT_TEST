// Frontend copy of the backend parser, adapted for browser use.
// Simple parser that turns raw PDF text into a question list.
// This is a heuristic parser; you should customize it for your own PDFs.
//
// Expected patterns (you can extend these):
// - Questions start like:  "1. What is 2 + 2?"
// - Options can be either:
//   - Lettered:    "A) 3", "B) 4", "C) Five", etc.
//   - Numbered:    "(1) option text", "2) option text", etc.
//   - Multiple numbered options on one line: "(1) one (2) two (3) three"

const QUESTION_REGEX = /^(\d+)[\).\s]+(.*)$/;
const OPTION_LETTER_REGEX = /^([A-Z])[\)\.\-\:]\s*(.*)$/;
const OPTION_NUMBER_REGEX = /^\(?(\d+)\)\s*(.*)$/;

export function parseQuestionsFromText(text) {
  // 0) Clean up some PDF artefacts specific to Allen-style sheets
  let cleaned = text;
  // Join split numbers like "200-\n300" -> "200-300"
  cleaned = cleaned.replace(/(\d+)\s*-\s*\n(\d+)/g, "$1-$2");
  // Remove repeated footer/header noise
  cleaned = cleaned.replace(
    /- FULL SYLLABUS.*?Space for Rough Work/gs,
    ""
  );

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions = [];
  let currentQuestion = null;

  for (const line of lines) {
    const qMatch = line.match(QUESTION_REGEX);

    if (qMatch) {
      // Start a new question
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      const [, qNumber, qText] = qMatch;
      const baseText = qText.trim();

      // Try to detect special types from the question text
      let qType = "single";
      const lower = baseText.toLowerCase();
      if (lower.includes("match the") || lower.includes("column i")) {
        qType = "match";
      } else if (lower.includes("assertion") && lower.includes("reason")) {
        qType = "assertion";
      } else if (
        lower.includes("statement-i") ||
        lower.includes("statement i") ||
        lower.includes("given below are two statements") ||
        lower.startsWith("statement-i")
      ) {
        qType = "statement";
      }

      currentQuestion = {
        id: qNumber,
        text: baseText,
        options: [],
        type: qType,
      };
    } else if (currentQuestion) {
      let handledAsOption = false;

      // 1) Handle multiple numbered options on the same line: "(1) ... (2) ..."
      const multiNumMatches = Array.from(
        line.matchAll(/\((\d+)\)\s*([^()]+)/g)
      );
      if (multiNumMatches.length > 1) {
        for (const match of multiNumMatches) {
          const [, num, textPart] = match;
          currentQuestion.options.push({
            id: num,
            label: num,
            text: textPart.trim(),
          });
        }
        handledAsOption = true;
      }

      // 2) Single option on a line (lettered or numbered)
      if (!handledAsOption) {
        const oLetter = line.match(OPTION_LETTER_REGEX);
        const oNumber = line.match(OPTION_NUMBER_REGEX);

        if (oLetter) {
          const [, label, optText] = oLetter;
          currentQuestion.options.push({
            id: label,
            label,
            text: optText.trim(),
          });
          handledAsOption = true;
        } else if (oNumber) {
          const [, num, optText] = oNumber;
          currentQuestion.options.push({
            id: num,
            label: num,
            text: optText.trim(),
          });
          handledAsOption = true;
        }
      }

      // 3) If not recognized as option, treat as continuation text
      if (!handledAsOption) {
        if (currentQuestion.options.length === 0) {
          // Append to question text
          currentQuestion.text += " " + line;
        } else {
          // Append to last option text
          const lastOpt =
            currentQuestion.options[currentQuestion.options.length - 1];
          lastOpt.text += " " + line;
        }
      }
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return { questions };
}


