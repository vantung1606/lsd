if (!getToken()) {
  window.location.href = "./auth.html";
}

const tbody = document.getElementById("leaderboard-body");
const top10Button = document.getElementById("top10-button");
const top50Button = document.getElementById("top50-button");
const sectionSelect = document.getElementById("section-select");

let currentLimit = 10;

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

async function loadSections() {
  const data = await apiRequest("/questions/sections");
  const sections = data.sections || [];
  const selectedFromQuery = getQueryParam("sectionKey");

  sectionSelect.innerHTML = "";
  const globalOption = document.createElement("option");
  globalOption.value = "global";
  globalOption.textContent = "Toàn hệ thống";
  sectionSelect.appendChild(globalOption);

  sections.forEach((section) => {
    const option = document.createElement("option");
    option.value = section.key;
    option.textContent = section.label;
    sectionSelect.appendChild(option);
  });

  if (selectedFromQuery && Array.from(sectionSelect.options).some((option) => option.value === selectedFromQuery)) {
    sectionSelect.value = selectedFromQuery;
  } else {
    sectionSelect.value = "global";
  }
}

async function loadLeaderboard(limit) {
  try {
    currentLimit = limit;
    const sectionKey = sectionSelect.value || "global";
    const data = await apiRequest(
      `/leaderboard?limit=${limit}&sectionKey=${encodeURIComponent(sectionKey)}`
    );
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

sectionSelect.addEventListener("change", () => loadLeaderboard(currentLimit));
top10Button.addEventListener("click", () => loadLeaderboard(10));
top50Button.addEventListener("click", () => loadLeaderboard(50));

async function init() {
  await loadSections();
  await loadLeaderboard(10);
}

init();
