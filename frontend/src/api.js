import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

// Audit endpoints
export async function runAudit(url) {
  const res = await axios.post(`${API_URL}/api/audit`, { url }, { headers: authHeaders() });
  return res.data;
}

export async function listAudits() {
  const res = await axios.get(`${API_URL}/api/audit`, { headers: authHeaders() });
  return res.data.audits;
}

export async function getAuditDetail(id) {
  const res = await axios.get(`${API_URL}/api/audit/${id}`, { headers: authHeaders() });
  return res.data;
}

// AI Test endpoints
export async function runAITest(url, query) {
  const res = await axios.post(`${API_URL}/api/ai-test`, { url, query }, { headers: authHeaders() });
  return res.data;
}

export async function listAITests() {
  const res = await axios.get(`${API_URL}/api/ai-test`, { headers: authHeaders() });
  return res.data.tests;
}

export async function getAITestDetail(id) {
  const res = await axios.get(`${API_URL}/api/ai-test/${id}`, { headers: authHeaders() });
  return res.data;
}

// Monitor endpoints
export async function addMonitor(url) {
  const res = await axios.post(`${API_URL}/api/monitor`, { url }, { headers: authHeaders() });
  return res.data;
}

export async function listMonitors() {
  const res = await axios.get(`${API_URL}/api/monitor`, { headers: authHeaders() });
  return res.data.pages;
}

export async function refreshMonitor(pageId) {
  const res = await axios.post(`${API_URL}/api/monitor/${pageId}/refresh`, {}, { headers: authHeaders() });
  return res.data;
}

export async function getPageChanges(pageId) {
  const res = await axios.get(`${API_URL}/api/monitor/${pageId}/changes`, { headers: authHeaders() });
  return res.data.changes;
}

export async function deleteMonitor(pageId) {
  await axios.delete(`${API_URL}/api/monitor/${pageId}`, { headers: authHeaders() });
}

// Reports endpoints
export async function getOverview() {
  const res = await axios.get(`${API_URL}/api/reports/overview`, { headers: authHeaders() });
  return res.data;
}

export async function getTrends(url) {
  const params = url ? `?url=${encodeURIComponent(url)}` : "";
  const res = await axios.get(`${API_URL}/api/reports/trends${params}`, { headers: authHeaders() });
  return res.data;
}

export async function getCompetitors() {
  const res = await axios.get(`${API_URL}/api/reports/competitors`, { headers: authHeaders() });
  return res.data;
}
