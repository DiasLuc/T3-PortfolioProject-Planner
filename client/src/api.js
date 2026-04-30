async function request(path, { method = "GET", token, body } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function registerUser(credentials) {
  return request("/auth/register", {
    method: "POST",
    body: credentials
  });
}

export function loginUser(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: credentials
  });
}

export function getTasksForDay(token, date) {
  return request(`/tasks/day/${date}`, { token });
}

export function createTask(token, task) {
  return request("/tasks", {
    method: "POST",
    token,
    body: task
  });
}

export function replaceDay(token, dayPayload) {
  return request("/tasks", {
    method: "PUT",
    token,
    body: dayPayload
  });
}

export function updateTask(token, taskId, task) {
  return request(`/tasks/${taskId}`, {
    method: "PUT",
    token,
    body: task
  });
}

export function deleteTask(token, taskId) {
  return request(`/tasks/${taskId}`, {
    method: "DELETE",
    token
  });
}

export function deleteDay(token, date) {
  return request(`/tasks/day/${date}`, {
    method: "DELETE",
    token
  });
}
