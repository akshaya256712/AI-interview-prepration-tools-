const API = "/api";
let token = localStorage.getItem("interviewprep_token") || "";
let user = null;
let questions = [];
let selectedQuestion = null;
let authMode = "register";

const $ = (id) => document.getElementById(id);
const escapeText = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}
function setMessage(id, message, isError = false) {
  const el = $(id); el.textContent = message; el.classList.toggle("error", isError);
}
function updateAuthUI() {
  $("show-login").classList.toggle("hidden", !!user);
  $("show-register").classList.toggle("hidden", !!user);
  $("logout").classList.toggle("hidden", !user);
  if (user) $("history-list").setAttribute("aria-label", `Practice history for ${user.name}`);
}
function openAuth(mode) {
  authMode = mode;
  $("auth-title").textContent = mode === "register" ? "Create your account" : "Welcome back";
  $("auth-description").textContent = mode === "register" ? "Save your answers and continue practicing later." : "Log in to continue your practice.";
  $("auth-name").classList.toggle("hidden", mode !== "register");
  $("auth-name").required = mode === "register";
  $("auth-password").autocomplete = mode === "register" ? "new-password" : "current-password";
  $("auth-submit").textContent = mode === "register" ? "Create account" : "Log in";
  $("switch-copy").textContent = mode === "register" ? "Already have an account?" : "New here?";
  $("switch-auth").textContent = mode === "register" ? "Log in" : "Create account";
  setMessage("auth-message", "");
  $("auth-modal").classList.remove("hidden");
}
function closeAuth() { $("auth-modal").classList.add("hidden"); }
function renderQuestions() {
  const category = $("category").value;
  const search = $("search").value.trim().toLowerCase();
  const filtered = questions.filter(q => (category === "All" || q.category === category) && q.question.toLowerCase().includes(search));
  const list = $("question-list"); list.replaceChildren();
  if (!filtered.length) { const p = document.createElement("p"); p.className = "muted"; p.textContent = "No questions match. Try another search."; list.append(p); return; }
  filtered.forEach(q => {
    const button = document.createElement("button"); button.className = "question-option" + (selectedQuestion?.id === q.id ? " active" : "");
    const strong = document.createElement("strong"); strong.textContent = q.question;
    const small = document.createElement("small"); small.textContent = q.category;
    button.append(strong, small); button.addEventListener("click", () => selectQuestion(q)); list.append(button);
  });
}
function selectQuestion(q) {
  selectedQuestion = q;
  $("question-category").textContent = q.category.toUpperCase();
  $("question-number").textContent = `Question #${q.id}`;
  $("question-title").textContent = q.question;
  $("question-tip").textContent = q.tip || "Answer clearly, give a specific example, and explain what you learned.";
  $("answer").value = "";
  $("save-answer").disabled = !user;
  setMessage("practice-message", user ? "" : "Log in to save your practice answer.");
  updateWordCount(); renderQuestions();
}
function updateWordCount() {
  const text = $("answer").value.trim();
  const count = text ? text.split(/\s+/).length : 0;
  $("word-count").textContent = `${count} ${count === 1 ? "word" : "words"}`;
}
async function loadQuestions() {
  try {
    const data = await request("/questions");
    questions = data.questions || [];
    $("stat-questions").textContent = questions.length;
    renderQuestions();
    if (questions.length) selectQuestion(questions[0]);
  } catch (error) {
    $("question-list").textContent = "Could not load questions. Make sure the backend and Supabase are configured.";
    setMessage("practice-message", error.message, true);
  }
}
async function loadHistory() {
  if (!user) {
    $("history-list").innerHTML = '<div class="empty-state">Log in to view your saved practice history.</div>';
    $("stat-practiced").textContent = "0"; $("stat-sessions").textContent = "0"; return;
  }
  try {
    const data = await request("/sessions");
    $("stat-practiced").textContent = data.sessions.length;
    $("stat-sessions").textContent = data.sessions.length;
    const list = $("history-list"); list.replaceChildren();
    if (!data.sessions.length) { const empty = document.createElement("div"); empty.className = "empty-state"; empty.textContent = "No practice saved yet. Choose a question and save your first answer."; list.append(empty); return; }
    data.sessions.forEach(session => {
      const card = document.createElement("article"); card.className = "history-item";
      const pill = document.createElement("span"); pill.className = "pill"; pill.textContent = session.category;
      const title = document.createElement("h3"); title.textContent = session.question_text;
      const answer = document.createElement("p"); answer.textContent = session.answer;
      const date = document.createElement("small"); date.textContent = new Date(session.created_at).toLocaleString();
      card.append(pill, title, answer, date); list.append(card);
    });
  } catch (error) { setMessage("practice-message", error.message, true); }
}
$("show-login").addEventListener("click", () => openAuth("login"));
$("show-register").addEventListener("click", () => openAuth("register"));
$("close-modal").addEventListener("click", closeAuth);
$("auth-modal").addEventListener("click", e => { if (e.target === $("auth-modal")) closeAuth(); });
$("switch-auth").addEventListener("click", () => openAuth(authMode === "register" ? "login" : "register"));
$("auth-form").addEventListener("submit", async e => {
  e.preventDefault(); const button = $("auth-submit"); button.disabled = true;
  try {
    const body = { name: $("auth-name").value.trim(), email: $("auth-email").value.trim(), password: $("auth-password").value };
    const data = await request(`/auth/${authMode}`, { method: "POST", body: JSON.stringify(body) });
    token = data.token; user = data.user; localStorage.setItem("interviewprep_token", token);
    closeAuth(); updateAuthUI(); if (selectedQuestion) $("save-answer").disabled = false; await loadHistory();
  } catch (error) { setMessage("auth-message", error.message, true); }
  finally { button.disabled = false; }
});
$("logout").addEventListener("click", () => {
  token = ""; user = null; localStorage.removeItem("interviewprep_token"); updateAuthUI();
  $("save-answer").disabled = true; loadHistory(); setMessage("practice-message", "You have logged out.");
});
$("category").addEventListener("change", renderQuestions);
$("search").addEventListener("input", renderQuestions);
$("answer").addEventListener("input", updateWordCount);
$("save-answer").addEventListener("click", async () => {
  if (!user || !selectedQuestion) return;
  const answer = $("answer").value.trim();
  if (answer.length < 10) { setMessage("practice-message", "Please write at least 10 characters before saving.", true); return; }
  $("save-answer").disabled = true;
  try {
    await request("/sessions", { method: "POST", body: JSON.stringify({ question_id: selectedQuestion.id, answer }) });
    setMessage("practice-message", "Answer saved! You can review it in Practice history.");
    await loadHistory();
  } catch (error) { setMessage("practice-message", error.message, true); }
  finally { $("save-answer").disabled = !user; }
});
$("refresh-history").addEventListener("click", loadHistory);

async function initialize() {
  try {
    if (token) {
      const data = await request("/auth/me"); user = data.user;
    }
  } catch { token = ""; user = null; localStorage.removeItem("interviewprep_token"); }
  updateAuthUI(); await loadQuestions(); await loadHistory();
}
initialize();
