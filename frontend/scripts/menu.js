const user = getCurrentUser();
if (!user || !getToken()) {
  window.location.href = "./auth.html";
}

const RANGE_KEYS = [
  "range-1-50",
  "range-51-100",
  "range-101-150",
  "range-151-200",
  "range-201-250",
  "range-251-300",
  "range-1-100",
  "range-101-200",
  "range-201-300",
  "range-1-300"
];
const MOCK_KEYS = ["mock-1", "mock-2", "mock-3", "mock-4", "mock-5", "mock-6"];

document.getElementById("username-display").textContent = user.username;
document.getElementById("stat-score").textContent = user.totalScore || 0;
document.getElementById("stat-correct").textContent = user.totalCorrectAnswers || 0;
document.getElementById("stat-attempts").textContent = user.totalAttempts || 0;

function createSectionButton(section) {
  const button = document.createElement("button");
  button.className = "secondary-button range-button";
  button.textContent = section.label;
  button.addEventListener("click", () => {
    localStorage.setItem("quiz_section", JSON.stringify(section));
    window.location.href = "./quiz.html";
  });
  return button;
}

async function renderSections() {
  try {
    const data = await apiRequest("/questions/sections");
    const sections = data.sections || [];
    const sectionMap = new Map(sections.map((section) => [section.key, section]));

    const rangeContainer = document.getElementById("range-sections");
    const mockContainer = document.getElementById("mock-sections");
    rangeContainer.innerHTML = "";
    mockContainer.innerHTML = "";

    RANGE_KEYS.forEach((key) => {
      const section = sectionMap.get(key);
      if (section) {
        rangeContainer.appendChild(createSectionButton(section));
      }
    });

    MOCK_KEYS.forEach((key) => {
      const section = sectionMap.get(key);
      if (section) {
        mockContainer.appendChild(createSectionButton(section));
      }
    });
  } catch (error) {
    alert(error.message);
  }
}

document.getElementById("logout-button").addEventListener("click", () => {
  clearSession();
  window.location.href = "./auth.html";
});

renderSections();
