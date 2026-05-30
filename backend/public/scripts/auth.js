const registerTab = document.getElementById("register-tab");
const loginTab = document.getElementById("login-tab");
const authForm = document.getElementById("auth-form");
const message = document.getElementById("auth-message");

let mode = "register";

registerTab.addEventListener("click", () => {
  mode = "register";
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
});

loginTab.addEventListener("click", () => {
  mode = "login";
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "Đang xử lý...";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    if (mode === "register") {
      await apiRequest("/auth/register", "POST", { username, password });
      message.textContent = "Đăng ký thành công. Bạn có thể đăng nhập ngay.";
      mode = "login";
      loginTab.classList.add("active");
      registerTab.classList.remove("active");
      return;
    }

    const data = await apiRequest("/auth/login", "POST", { username, password });
    saveSession(data.token, data.user);
    window.location.href = "./menu.html";
  } catch (error) {
    message.textContent = error.message;
  }
});
