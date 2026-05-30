const user = getCurrentUser();
if (!user || !getToken()) {
  window.location.href = "./auth.html";
}

document.getElementById("username-display").textContent = user.username;

// Display user stats
document.getElementById("stat-score").textContent = user.totalScore || 0;
document.getElementById("stat-correct").textContent = user.totalCorrectAnswers || 0;
document.getElementById("stat-attempts").textContent = user.totalAttempts || 0;

document.querySelectorAll(".range-button").forEach((button) => {
  button.addEventListener("click", () => {
    const start = Number(button.dataset.start);
    const end = Number(button.dataset.end);
    localStorage.setItem("quiz_range", JSON.stringify({ start, end }));
    window.location.href = "./quiz.html";
  });
});

document.getElementById("logout-button").addEventListener("click", () => {
  clearSession();
  window.location.href = "./auth.html";
});
