/* =========================================================
   Stilometrie – Lernlandschaft
   Datei: assets/js/app.js
   Version: Lieferung 7
   Zweck:
   - Sofortkorrektur
   - Fortschrittsspeicherung
   - methodisch differenziertes Feedback
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

  progressBox.textContent =
    "Bearbeitete Aufgaben: " + completed.length;
}

/* -------------------------
   Multiple-Choice-Korrektur
   ------------------------- */

function checkMC(taskId, correctAnswers) {
  const inputs = document.querySelectorAll(
    'input[name="' + taskId + '"]:checked'
  );

  let userAnswers = Array.from(inputs).map(i => i.value);
  let feedbackBox = document.getElementById(taskId + "-feedback");

  if (!feedbackBox) return;

  let correct = correctAnswers.every(a => userAnswers.includes(a)) &&
                userAnswers.length === correctAnswers.length;

  if (correct) {
    feedbackBox.className = "feedback correct";
    feedbackBox.textContent =
      "Korrekt. Deine Auswahl entspricht der methodisch zulässigen Aussage.";
    markCompleted(taskId);
  } else if (userAnswers.length > 0) {
    feedbackBox.className = "feedback partial";
    feedbackBox.textContent =
      "Teilweise korrekt. Prüfe, ob du Ebenen vermischst (technisch / methodisch / fachlich).";
  } else {
    feedbackBox.className = "feedback incorrect";
    feedbackBox.textContent =
      "Keine Auswahl getroffen. Lies die Frage nochmals sorgfältig.";
  }
}

/* -------------------------
   Freitext-Korrektur (qualitativ)
   ------------------------- */

function checkText(taskId, keywords) {
  const textarea = document.getElementById(taskId + "-input");
  const feedbackBox = document.getElementById(taskId + "-feedback");

  if (!textarea || !feedbackBox) return;

  const text = textarea.value.toLowerCase();
  let matches = keywords.filter(k => text.includes(k));

  if (matches.length >= keywords.length) {
    feedbackBox.className = "feedback correct";
    feedbackBox.textContent =
      "Sehr gut. Deine Antwort greift die zentralen methodischen Aspekte auf.";
    markCompleted(taskId);
  } else if (matches.length > 0) {
    feedbackBox.className = "feedback partial";
    feedbackBox.textContent =
      "Ansatz erkennbar, aber unvollständig. Achte stärker auf Methode statt Ergebnis.";
  } else {
    feedbackBox.className = "feedback incorrect";
    feedbackBox.textContent =
      "Deine Antwort bleibt zu allgemein oder argumentiert inhaltlich statt methodisch.";
  }
}

/* -------------------------
   Initialisierung
   ------------------------- */

document.addEventListener("DOMContentLoaded", function () {
  updateProgress();
});
