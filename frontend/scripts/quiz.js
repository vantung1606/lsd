class QuizSoundManager {
  constructor() {
    this.correctSounds = [
      'https://www.myinstants.com/media/sounds/oh-my-god-meme.mp3',
      'https://www.myinstants.com/media/sounds/10-diem.mp3',
      'https://www.myinstants.com/media/sounds/ghe-chua-ghe-chua.mp3',
      'https://www.myinstants.com/media/sounds/tieng-vo-tay.mp3'
    ];

    this.wrongSounds = [
      'https://www.myinstants.com/media/sounds/gago-effect-by-cong-tv.mp3',
      'https://www.myinstants.com/media/sounds/kha-banh-ao-that-day.mp3',
      'https://www.myinstants.com/media/sounds/y2mate-mp3cut_d1tt0z9.mp3',
      'https://www.myinstants.com/media/sounds/ua-j-zo.mp3',
      'https://www.myinstants.com/media/sounds/anh-nhac-em.mp3'
    ];
    
    this.finishSound = new Audio('https://www.myinstants.com/media/sounds/final-fantasy-vii-victory-fanfare-1.mp3');
  }

  init() {}
  playStart() {}

  playCorrect() {
    if (localStorage.getItem("meme_music_disabled") === "true") return;
    const url = this.correctSounds[Math.floor(Math.random() * this.correctSounds.length)];
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(e => console.warn(e));
  }

  playWrong() {
    if (localStorage.getItem("meme_music_disabled") === "true") return;
    const url = this.wrongSounds[Math.floor(Math.random() * this.wrongSounds.length)];
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(e => console.warn(e));
  }

  playFinish() {
    this.finishSound.currentTime = 0;
    this.finishSound.volume = 0.5;
    this.finishSound.play().catch(e => console.warn(e));
  }
}
const sounds = new QuizSoundManager();

const sectionRaw = localStorage.getItem("quiz_section");
if (!sectionRaw || !getToken()) {
  window.navigateTo("./menu.html");
}

const selectedSection = JSON.parse(sectionRaw);
const questionText = document.getElementById("question-text");
const sectionTitleText = document.getElementById("quiz-section-title");
const questionHeaderNumber = document.getElementById("quiz-question-number-header");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const prevButton = document.getElementById("prev-button");
let questions = [];
let currentIndex = 0;
let answers = []; // Indexed by question index to support back navigation cleanly

function saveProgress() {
  const progressData = {
    currentIndex,
    answers
  };
  // Save to DB
  const payload = { answers, order: questions.map(q => q.id || q._id) };
  apiRequest("/quiz/progress", "POST", {
    sectionKey: selectedSection.key,
    currentIndex: currentIndex,
    answers: payload
  }).catch(e => console.error(e));
}

function addFeedbackText(button, isCorrect) {
  if (button.querySelector(".feedback-text")) return;
  const feedback = document.createElement("div");
  feedback.className = "feedback-text";
  feedback.textContent = isCorrect ? "Câu trả lời đúng! 💙" : "Bạn chọn sai rồi! 😢";
  button.appendChild(feedback);
}

function renderQuestion() {
  const question = questions[currentIndex];
  
  // Set header texts to match Stitch quiz theme
  if (sectionTitleText) {
    sectionTitleText.textContent = `Bộ câu hỏi: ${selectedSection.label}`;
  }
  if (questionHeaderNumber) {
    questionHeaderNumber.textContent = `Câu ${currentIndex + 1} / ${questions.length}`;
  }
  
  // Clean question text
  questionText.textContent = question.questionText;
  optionsContainer.innerHTML = "";
  nextButton.classList.add("hidden");
  

  // Show/Hide back button
  if (prevButton) {
    if (currentIndex > 0) {
      prevButton.classList.remove("hidden");
    } else {
      prevButton.classList.add("hidden");
    }
  }

  // Check if this question was already answered
  const previousAnswer = answers[currentIndex];

  question.options.forEach((option, optionIndex) => {
    const button = document.createElement("button");
    button.className = "option-button";
    button.textContent = `${String.fromCharCode(65 + optionIndex)}. ${option.text}`;
    
    if (previousAnswer !== undefined && previousAnswer !== null) {
      // Question already answered: disable and highlight
      button.classList.add("disabled");
      if (optionIndex === question.correctOptionIndex) {
        button.classList.add("correct");
        addFeedbackText(button, true);
      }
      if (optionIndex === previousAnswer.selectedOptionIndex && optionIndex !== question.correctOptionIndex) {
        button.classList.add("wrong");
        addFeedbackText(button, false);
      }
    } else {
      // Normal state
      button.addEventListener("click", () => handleAnswer(question, optionIndex));
    }
    optionsContainer.appendChild(button);
  });

  // If already answered, show explanation and next button
  if (previousAnswer !== undefined && previousAnswer !== null) {
    
    nextButton.classList.remove("hidden");
    
    if (currentIndex === questions.length - 1) {
      nextButton.textContent = "Nộp bài 🏁";
      
    } else {
      nextButton.textContent = "Câu tiếp theo ➜";
      
    }
  }
}

function handleAnswer(question, selectedOptionIndex) {
  const optionButtons = Array.from(document.querySelectorAll(".option-button"));
  const isCorrect = selectedOptionIndex === question.correctOptionIndex;

  if (isCorrect) {
    sounds.playCorrect();
  } else {
    sounds.playWrong();
  }

  optionButtons.forEach((button, index) => {
    button.classList.add("disabled");
    if (index === question.correctOptionIndex) {
      button.classList.add("correct");
      addFeedbackText(button, true);
    }
    if (index === selectedOptionIndex && !isCorrect) {
      button.classList.add("wrong");
      addFeedbackText(button, false);
    }
  });

  // Store answer by index to avoid duplicates
  answers[currentIndex] = {
    questionId: question._id,
    selectedOptionIndex
  };
  saveProgress();

  
  nextButton.classList.remove("hidden");
  
  if (currentIndex === questions.length - 1) {
    nextButton.textContent = "Nộp bài 🏁";
    
  } else {
    nextButton.textContent = "Câu tiếp theo ➜";
    
  }
}

async function submitQuiz() {
  try {
     // Stop music when quiz completes
    const payload = {
      sectionKey: selectedSection.key,
      answers: answers.filter(a => a !== undefined)
    };

    if (selectedSection.type === "range") {
      payload.start = selectedSection.start;
      payload.end = selectedSection.end;
    } else {
      payload.start = 1;
      payload.end = 300;
    }

    const result = await apiRequest("/quiz/submit", "POST", payload);
    sounds.playFinish();
    apiRequest(`/quiz/progress?sectionKey=${encodeURIComponent(selectedSection.key)}`, "DELETE").catch(e=>console.error(e));

    setTimeout(() => {
      alert(
        `Hoàn thành ${selectedSection.label}! Bạn đúng ${result.result.correctAnswers}/${result.result.totalQuestions} câu.`
      );
      window.navigateTo(`./leaderboard.html?sectionKey=${encodeURIComponent(selectedSection.key)}`);
    }, 500);
  } catch (error) {
    await cuteAlert(error.message);
  }
}

nextButton.addEventListener("click", async () => {
  if (currentIndex < questions.length - 1) {
    currentIndex += 1;
    saveProgress();
    renderQuestion();
  } else {
    await submitQuiz();
  }
});



if (prevButton) {
  prevButton.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      saveProgress();
      renderQuestion();
    }
  });
}

async function initQuiz() {
  try {
    const data = await apiRequest(`/questions?sectionKey=${encodeURIComponent(selectedSection.key)}`);
    questions = data.questions || [];
    if (!questions.length) {
      await cuteAlert("Không có câu hỏi trong phần đã chọn.");
      window.navigateTo("./menu.html");
      return;
    }
    sounds.playStart();
    
    
    if (selectedSection.order === "random") {
      questions = questions.sort(() => Math.random() - 0.5);
    }
    
    let hasProgress = false;
    // Load progress
    try {
      const progressRes = await apiRequest(`/quiz/progress?sectionKey=${encodeURIComponent(selectedSection.key)}`);
      if (progressRes && progressRes.progress) {
        hasProgress = true;
        const saved = progressRes.progress;
        if (saved.answers_json) {
          const parsed = typeof saved.answers_json === 'string' ? JSON.parse(saved.answers_json) : saved.answers_json;
          if (Array.isArray(parsed)) {
            answers = parsed;
          } else {
            answers = parsed.answers || [];
            if (parsed.order && parsed.order.length > 0) {
              const qMap = new Map(questions.map(q => [q.id || q._id, q]));
              questions = parsed.order.map(id => qMap.get(id)).filter(Boolean);
            }
          }
        }
        if (typeof saved.current_index === 'number' && saved.current_index < questions.length) {
          currentIndex = saved.current_index;
        }
      }
    } catch (e) { console.error(e); }
    
    if (!hasProgress) {
      saveProgress();
    }
    
    renderQuestion();
  } catch (error) {
    await cuteAlert(error.message);
    window.navigateTo("./menu.html");
  }
}



initQuiz();
