class QuizSoundManager {
  constructor() {
    this.audioCtx = null;
  }

  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playStart() {
    try {
      this.init();
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Cute rising chime: C5 -> E5 -> G5
      const notes = [523.25, 659.25, 783.99];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0.15, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.25);
      });
    } catch (e) {
      console.warn("Audio autoplay blocked or unsupported", e);
    }
  }

  playCorrect() {
    try {
      this.init();
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Cheerful ding: G5 -> C6
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(783.99, now);
      osc.frequency.setValueAtTime(1046.50, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0.2, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }

  playWrong() {
    try {
      this.init();
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Low buzz / falling sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }

  playFinish() {
    try {
      this.init();
      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      // Fanfare: C5 -> E5 -> G5 -> C6
      const notes = [
        { freq: 523.25, time: 0 },
        { freq: 659.25, time: 0.1 },
        { freq: 783.99, time: 0.2 },
        { freq: 1046.50, time: 0.3 }
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0.2, now + note.time);
        gain.gain.exponentialRampToValueAtTime(0.01, now + note.time + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + 0.4);
      });
    } catch (e) {
      console.warn("Audio play failed", e);
    }
  }
}

const sounds = new QuizSoundManager();
document.addEventListener("click", () => sounds.init(), { once: true });

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

  if (isCorrect) {
    sounds.playCorrect();
  } else {
    sounds.playWrong();
  }

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
    sounds.playFinish();

    setTimeout(() => {
      alert(
        `Hoàn thành ${selectedSection.label}! Bạn đúng ${result.result.correctAnswers}/${result.result.totalQuestions} câu.`
      );
      window.location.href = `./leaderboard.html?sectionKey=${encodeURIComponent(selectedSection.key)}`;
    }, 500);
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
    sounds.playStart();
    renderQuestion();
  } catch (error) {
    alert(error.message);
    window.location.href = "./menu.html";
  }
}

initQuiz();
