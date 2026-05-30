const sectionRaw = localStorage.getItem("quiz_section");
if (!sectionRaw || !getToken()) {
  window.location.href = "./menu.html";
}

const selectedSection = JSON.parse(sectionRaw);
const questionText = document.getElementById("question-text");
const progressText = document.getElementById("quiz-progress");
const optionsContainer = document.getElementById("options-container");
const explanationBox = document.getElementById("explanation-box");
const nextButton = document.getElementById("next-button");

let questions = [];
let currentIndex = 0;
let answers = [];

function renderQuestion() {
  const question = questions[currentIndex];
  progressText.textContent = `Câu ${currentIndex + 1}/${questions.length} | ${selectedSection.label}`;
  questionText.textContent = `${question.questionNumber}. ${question.questionText}`;
  optionsContainer.innerHTML = "";
  explanationBox.classList.add("hidden");
  nextButton.classList.add("hidden");

  question.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option.text}`;
    button.addEventListener("click", () => handleAnswer(question, optionIndex));
    optionsContainer.appendChild(button);
  });
}

function handleAnswer(question, selectedOptionIndex) {
  const optionButtons = Array.from(document.querySelectorAll(".option-button"));
  const isCorrect = selectedOptionIndex === question.correctOptionIndex;

  optionButtons.forEach((button, index) => {
    button.classList.add("disabled");
    if (index === question.correctOptionIndex) {
      button.classList.add("correct");
    }
    if (index === selectedOptionIndex && !isCorrect) {
      button.classList.add("wrong");
    }
  });

  answers.push({
    questionId: question._id,
    selectedOptionIndex
  });

  explanationBox.textContent = `Giải thích: ${question.explanation}`;
  explanationBox.classList.remove("hidden");
  nextButton.classList.remove("hidden");
}

async function submitQuiz() {
  try {
    const payload = {
      sectionKey: selectedSection.key,
      answers
    };

    if (selectedSection.type === "range") {
      payload.start = selectedSection.start;
      payload.end = selectedSection.end;
    } else {
      payload.start = 1;
      payload.end = 300;
    }

    const result = await apiRequest("/quiz/submit", "POST", payload);
    alert(
      `Hoàn thành ${selectedSection.label}! Bạn đúng ${result.result.correctAnswers}/${result.result.totalQuestions} câu.`
    );
    window.location.href = `./leaderboard.html?sectionKey=${encodeURIComponent(selectedSection.key)}`;
  } catch (error) {
    alert(error.message);
  }
}

nextButton.addEventListener("click", async () => {
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    renderQuestion();
  } else {
    await submitQuiz();
  }
});

async function initQuiz() {
  try {
    const data = await apiRequest(`/questions?sectionKey=${encodeURIComponent(selectedSection.key)}`);
    questions = data.questions || [];
    if (!questions.length) {
      alert("Không có câu hỏi trong phần đã chọn.");
      window.location.href = "./menu.html";
      return;
    }
    renderQuestion();
  } catch (error) {
    alert(error.message);
    window.location.href = "./menu.html";
  }
}

initQuiz();
