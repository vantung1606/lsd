if (!getToken()) {
  window.location.href = "./auth.html";
}

const tbody = document.getElementById("leaderboard-body");
const top10Button = document.getElementById("top10-button");
const top50Button = document.getElementById("top50-button");

async function loadLeaderboard(limit) {
  try {
    const data = await apiRequest(`/leaderboard?limit=${limit}`);
    tbody.innerHTML = "";
    data.leaderboard.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.rank}</td>
        <td>${item.username}</td>
        <td>${item.totalCorrectAnswers}</td>
        <td>${item.totalScore}</td>
        <td>${item.totalAttempts}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    alert(error.message);
  }
}

top10Button.addEventListener("click", () => loadLeaderboard(10));
top50Button.addEventListener("click", () => loadLeaderboard(50));

loadLeaderboard(10);
