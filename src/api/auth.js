import api from "./axios";

const LOGIN_URL = "/auth/login";
const REGISTER_URL = "/auth/register";

export function roleFromToken(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    return payload.role || null;
  } catch {
    return null;
  }
}

export async function loginRequest(email, password) {
  let data;
  try {
    // Try standard JSON body first
    const res = await api.post(LOGIN_URL, { email, password });
    data = res.data;
  } catch (err) {
    // If backend requires form urlencoded, send form with email and username fallback
    if (err.response?.status === 422) {
      const form = new URLSearchParams({
        email,
        username: email,
        password,
      });
      const res = await api.post(LOGIN_URL, form);
      data = res.data;
    } else {
      throw err;
    }
  }

  const token = data.access_token;
  const role = (
    data.role ||
    data.user?.role ||
    roleFromToken(token) ||
    "USER"
  ).toUpperCase();

  return {
    token,
    role,
    user: {
      id: data.user_id,
      name: data.name,
      email: data.email,
    },
  };
}

export const registerRequest = (payload) => api.post(REGISTER_URL, payload);

export function errorMessage(err) {
  if (!err) return "An unexpected error occurred.";
  if (!err.response) {
    return "Cannot reach backend server. Please verify FastAPI is running at http://localhost:8000.";
  }
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg || e.message).join(", ");
  }
  return "Request failed. Please check your input and try again.";
}
