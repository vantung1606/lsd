const API_BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("quiz_token");
}

function getCurrentUser() {
  const raw = localStorage.getItem("quiz_user");
  return raw ? JSON.parse(raw) : null;
}

function saveSession(token, user) {
  localStorage.setItem("quiz_token", token);
  localStorage.setItem("quiz_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("quiz_token");
  localStorage.removeItem("quiz_user");
  localStorage.removeItem("quiz_range");
}

async function apiRequest(path, method = "GET", body) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "API request failed.");
  }
  return data;
}
