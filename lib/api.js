const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/**
 * Lightweight fetch wrapper. Attaches the Bearer token (from localStorage)
 * automatically if present, and normalizes error handling.
 */
async function apiRequest(endpoint, { method = "GET", body, token } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data?.message || "Something went wrong. Please try again.";
    const error = new Error(message);
    error.status = res.status;
    error.errors = data?.errors;
    throw error;
  }

  return data;
}

export const api = {
  // ---- Auth ----
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: payload }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload }),
  getMe: (token) => apiRequest("/auth/me", { token }),

  // ---- Users ----
  updateProfile: (payload) => apiRequest("/users/me", { method: "PUT", body: payload }),
  linkChild: (studentEmail) =>
    apiRequest("/users/link-child", { method: "POST", body: { studentEmail } }),
  getMyChildren: () => apiRequest("/users/my-children"),

  // ---- Quizzes ----
  startQuiz: (payload) => apiRequest("/quizzes/start", { method: "POST", body: payload }),
  submitQuiz: (quizId, answers) =>
    apiRequest(`/quizzes/${quizId}/submit`, { method: "POST", body: { answers } }),
  getQuizHistory: () => apiRequest("/quizzes/history"),

  // ---- Progress ----
  getMyProgress: () => apiRequest("/progress/me"),
  getChildProgress: (studentId) => apiRequest(`/progress/child/${studentId}`),

  // ---- AI Tutor ----
  explainQuestion: (questionId) =>
    apiRequest("/ai/explain", { method: "POST", body: { questionId } }),
  tutorChat: (payload) => apiRequest("/ai/tutor-chat", { method: "POST", body: payload }),
};

export default api;
