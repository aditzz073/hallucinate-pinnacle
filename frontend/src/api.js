import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

function authHeaders() {
  const token = localStorage.getItem("token");
  // Only include Authorization header if token exists
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
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

// Auth endpoints
export async function changePassword(currentPassword, newPassword) {
  const res = await axios.post(
    `${API_URL}/api/auth/change-password`,
    { current_password: currentPassword, new_password: newPassword },
    { headers: authHeaders() }
  );
  return res.data;
}

export async function generateApiKey() {
  const res = await axios.post(
    `${API_URL}/api/auth/api-key`,
    {},
    { headers: authHeaders() }
  );
  return res.data;
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

// Phase 5 - Advanced Audit
export async function runAdvancedAudit(url) {
  const res = await axios.post(`${API_URL}/api/audit/advanced`, { url }, { headers: authHeaders() });
  return res.data;
}

// Phase 6 - Content Compiler
export async function compileContent(url) {
  const res = await axios.post(`${API_URL}/api/compile`, { url }, { headers: authHeaders() });
  return res.data;
}

// Phase 7 - Strategy Simulator
export async function simulateStrategy(url, query, strategy) {
  const res = await axios.post(`${API_URL}/api/simulate-strategy`, { url, query, strategy }, { headers: authHeaders() });
  return res.data;
}

// Phase 9 - Enterprise
export async function compareCompetitors(query, primaryUrl, competitorUrls) {
  const res = await axios.post(`${API_URL}/api/enterprise/compare`, { query, primary_url: primaryUrl, competitor_urls: competitorUrls }, { headers: authHeaders() });
  return res.data;
}

export async function sensitivityTest(url, query, mode) {
  const res = await axios.post(`${API_URL}/api/enterprise/sensitivity-test`, { url, query, mode }, { headers: authHeaders() });
  return res.data;
}

export async function getExecutiveSummary() {
  const res = await axios.get(`${API_URL}/api/enterprise/executive-summary`, { headers: authHeaders() });
  return res.data;
}

// AI Testing Lab endpoints
export async function runAITestingLab(query, url, engines) {
  const res = await axios.post(
    `${API_URL}/api/ai-testing-lab/run`,
    { query, url, engines },
    { headers: authHeaders() }
  );
  return res.data;
}

export async function getAIEngines() {
  const res = await axios.get(`${API_URL}/api/ai-testing-lab/engines`);
  return res.data;
}
