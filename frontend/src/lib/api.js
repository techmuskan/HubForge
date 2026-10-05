// Local development can use the backend fallback; deployed builds must provide a public API URL.
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");

async function request(path, options = {}) {
  if (!API_URL) throw new Error("Service is not configured. Set VITE_API_URL in the frontend deployment settings.");
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || "Something went wrong. Please try again.");
  return payload;
}

async function download(path) {
  if (!API_URL) throw new Error("Service is not configured. Set VITE_API_URL in the frontend deployment settings.");
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Unable to download this file.");
  }
  return response.blob();
}

export const api = {
  login: (body) => request("/login", { method: "POST", body: JSON.stringify(body) }),
  signup: (body) => request("/signup", { method: "POST", body: JSON.stringify(body) }),
  profile: (id) => request(`/userProfile/${id}`),
  updateProfile: (id, body) => request(`/updateProfile/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  repos: () => request("/repo/all"),
  myRepos: (id) => request(`/repo/user/${id}`),
  repo: (id) => request(`/repo/${id}`),
  repoFiles: (id) => request(`/repo/${id}/files`),
  downloadRepoFile: (id, filePath, commit) => download(`/repo/${id}/file?path=${encodeURIComponent(filePath)}&commit=${encodeURIComponent(commit)}`),
  createRepo: (body) => request("/repo/create", { method: "POST", body: JSON.stringify(body) }),
  deleteRepo: (id) => request(`/repo/delete/${id}`, { method: "DELETE" }),
  toggleRepo: (id) => request(`/repo/toggle/${id}`, { method: "PATCH", body: JSON.stringify({}) }),
  issues: (repoId) => request(`/issue/all/${repoId}`),
  createIssue: (body) => request("/issue/create", { method: "POST", body: JSON.stringify(body) }),
  updateIssue: (id, body) => request(`/issue/update/${id}`, { method: "PUT", body: JSON.stringify(body) }),
};
