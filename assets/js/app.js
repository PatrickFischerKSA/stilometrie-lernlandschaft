/* =========================================================
   Stilometrie – Lernlandschaft
   Datei: assets/js/app.js
   Version: v2 (Lieferung 11 – Vertiefung 1–5)
   Änderungen gegenüber v1:
   - MC-Feedback differenziert (zeigt fehlende/zusätzliche Optionen)
   - Freitext-Feedback differenziert (zeigt fehlende Keywords)
   - Optional: feedback-div kann data-correct / data-partial / data-incorrect / data-none enthalten
   ========================================================= */

/* -------------------------
   Fortschritt (localStorage)
   ------------------------- */
function markCompleted(taskId) {
  let completed = JSON.parse(localStorage.getItem("completedTasks")) || [];
  if (!completed.includes(taskId)) {
    completed.push(taskId);
    localStorage.setItem("completedTasks", JSON.stringify(completed));
  }
  updateProgress();
}

function updateProgress() {
  const completed = JSON.parse(localStorage.getItem("completedTasks")) || [];
  const progressBox = document.getElementById("progress");
  if (!progressBox) return;
  progressBox.textContent = "Bearbeitete Aufgaben: " + completed.length;
}

/* -------------------------
   Hilfen: custom messages via data-*
   ------------------------- */
function getCustomMsg(feedbackBox, kind) {
  if (!feedbackBox) return null;
  const key = "data-" + kind;
  if (feedbackBox.hasAttribute(key)) return feedbackBox.getAttribute(key);
  return null;
}

/* -------------------------
   Multiple-Choice-Korrektur
   -------------------------
   Supports radio and checkbox:
   - Uses checked inputs for name=taskId
   - Correct if exact match with correctAnswers
*/
function checkMC(taskId, correctAnswers) {
  const inputs = document.querySelectorAll('input[name="' + taskId + '"]:checked');
  const userAnswers = Array.from(inputs).map(i => i.value);
  const feedbackBox = document.getElementById(taskId + "-feedback");
  if (!feedbackBox) return;

  const missing = correctAnswers.filter(a => !userAnswers.includes(a));
  const extra = userAnswers.filter(a => !correctAnswers.includes(a));

  const isCorrect = missing.length === 0 && extra.length === 0 && userAnswers.length === correctAnswers.length;

  if (isCorrect) {
    feedbackBox.className = "feedback correct";
    feedbackBox.textContent =
      getCustomMsg(feedbackBox, "correct") ||
      "Korrekt. Deine Auswahl ist methodisch zulässig.";
    markCompleted(taskId);
    return;
  }

  if (userAnswers.length === 0) {
    feedbackBox.className = "feedback incorrect";
    feedbackBox.textContent =
      getCustomMsg(feedbackBox, "none") ||
      "Keine Auswahl getroffen. Lies die Frage nochmals sorgfältig.";
    return;
  }

  // Partially correct if at least one correct option selected and no contradictory instruction? (we handle via message)
  const selectedCorrect = userAnswers.filter(a => correctAnswers.includes(a));
  const isPartial = selectedCorrect.length > 0;

  feedbackBox.className = "feedback " + (isPartial ? "partial" : "incorrect");

  const baseMsg = getCustomMsg(feedbackBox, isPartial ? "partial" : "incorrect") ||
    (isPartial ?
      "Teilweise korrekt. Prüfe fehlende/zusätzliche Optionen:" :
      "Nicht korrekt. Prüfe deine Auswahl:"
    );

  let details = [];
  if (missing.length) details.push("Fehlt: " + missing.join(", "));
  if (extra.length) details.push("Zu viel: " + extra.join(", "));

  feedbackBox.textContent = baseMsg + (details.length ? " " + details.join(" | ") : "");
}

/* -------------------------
   Freitext-Korrektur (qualitativ, keyword-basiert)
   -------------------------
   - requires textarea id = taskId + "-input"
   - feedback div id = taskId + "-feedback"
*/
function checkText(taskId, keywords) {
  const textarea = document.getElementById(taskId + "-input");
  const feedbackBox = document.getElementById(taskId + "-feedback");
  if (!textarea || !feedbackBox) return;

  const text = (textarea.value || "").toLowerCase().trim();
  const matches = keywords.filter(k => text.includes(k.toLowerCase()));
  const missing = keywords.filter(k => !text.includes(k.toLowerCase()));

  // Thresholds:
  // - correct: all keywords present
  // - partial: at least 2 keywords or at least half (>= ceil(n/2))
  const half = Math.ceil(keywords.length / 2);
  const isCorrect = matches.length >= keywords.length;
  const isPartial = !isCorrect && (matches.length >= Math.min(2, keywords.length) || matches.length >= half);

  if (isCorrect) {
    feedbackBox.className = "feedback correct";
    feedbackBox.textContent =
      getCustomMsg(feedbackBox, "correct") ||
      "Sehr gut. Du nennst die zentralen methodischen Aspekte.";
    markCompleted(taskId);
    return;
  }

  if (text.length === 0) {
    feedbackBox.className = "feedback incorrect";
    feedbackBox.textContent =
      getCustomMsg(feedbackBox, "none") ||
      "Noch keine Antwort. Schreibe mindestens 2–3 Sätze und beziehe dich auf Methode (nicht Inhalt).";
    return;
  }

  feedbackBox.className = "feedback " + (isPartial ? "partial" : "incorrect");

  const baseMsg = getCustomMsg(feedbackBox, isPartial ? "partial" : "incorrect") ||
    (isPartial ?
      "Ansatz erkennbar, aber noch unvollständig. Ergänze gezielt:" :
      "Zu allgemein oder inhaltlich. Setze methodische Begriffe ein:"
    );

  const hint = missing.length ? (" Fehlende Stichworte (Orientierung): " + missing.join(", ")) : "";
  feedbackBox.textContent = baseMsg + hint;
}

document.addEventListener("DOMContentLoaded", function () {
  updateProgress();
});
