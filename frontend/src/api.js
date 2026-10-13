export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export async function startSession(payload) {
  throw new Error('Not implemented yet');
}

export async function confirmList(sessionId, medicines) {
  throw new Error('Not implemented yet');
}

export async function getResult(sessionId) {
  throw new Error('Not implemented yet');
}

export async function askQuestion(sessionId, text) {
  throw new Error('Not implemented yet');
}
