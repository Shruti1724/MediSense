// api.js - talks to Member A's FastAPI backend
const BASE = "http://localhost:8000";

async function handle(res) {
  if (!res.ok) {
    let detail = "Request failed";
    try {
      detail = (await res.json()).detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

// Photo upload (multipart). mode: "prescription" | "home" | "ask"
export async function startWithImage(mode, imageFile) {
  const form = new FormData();
  form.append("mode", mode);
  form.append("consent", "true");
  form.append("image", imageFile);
  return handle(await fetch(`${BASE}/start`, { method: "POST", body: form }));
}

// Typed name (JSON)
export async function startWithText(mode, typedName, question = null) {
  return handle(
    await fetch(`${BASE}/start/json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, consent: true, typed_name: typedName, question }),
    })
  );
}

// Send the user-edited medicine list
export async function confirmMedicines(sessionId, medicines) {
  return handle(
    await fetch(`${BASE}/confirm/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicines }),
    })
  );
}

// Step log: returns { steps: [...], status }
export async function getSteps(sessionId) {
  return handle(await fetch(`${BASE}/stream/${sessionId}`));
}

// Final Result
export async function getResult(sessionId) {
  return handle(await fetch(`${BASE}/result/${sessionId}`));
}

// Ask a question or situation. Returns a Result (type "answer")
export async function askQuestion(sessionId, question, situation = "", medicines = []) {
  return handle(
    await fetch(`${BASE}/ask/${sessionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, situation, medicines }),
    })
  );
}

// PDF download link
export function pdfUrl(sessionId) {
  return `${BASE}/result/${sessionId}/pdf`;
}