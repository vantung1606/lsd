const registerTab = document.getElementById("register-tab");
const loginTab = document.getElementById("login-tab");
const authForm = document.getElementById("auth-form");
const submitButton = document.getElementById("auth-submit");
const message = document.getElementById("auth-message");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

let mode = "register";

function setMode(nextMode) {
  mode = nextMode;
  registerTab.classList.toggle("active", nextMode === "register");
  loginTab.classList.toggle("active", nextMode === "login");
}

registerTab.addEventListener("click", () => setMode("register"));
loginTab.addEventListener("click", () => setMode("login"));

function validateInputs() {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (username.length < 3) {
    throw new Error("Tên tài khoản phải từ 3 ký tự trở lên.");
  }
  if (password.length < 6) {
    throw new Error("Mật khẩu phải từ 6 ký tự trở lên.");
  }

  return { username, password };
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  message.textContent = "Đang xử lý...";
  submitButton.disabled = true;

  try {
    const { username, password } = validateInputs();

    if (mode === "register") {
      await apiRequest("/auth/register", "POST", { username, password });
      message.textContent = "Đăng ký thành công. Bạn có thể đăng nhập ngay.";
      setMode("login");
      submitButton.disabled = false;
      return;
    }

    const data = await apiRequest("/auth/login", "POST", { username, password });
    saveSession(data.token, data.user);
    window.navigateTo("./menu.html");
  } catch (error) {
    message.textContent = error.message || "Có lỗi xảy ra, vui lòng thử lại.";
    submitButton.disabled = false;
  }
}

authForm.addEventListener("submit", handleAuthSubmit);
