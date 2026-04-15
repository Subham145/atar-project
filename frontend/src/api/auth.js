const API_BASE = "/api";

/**
 * @typedef {{
 *   email: string,
 *   password: string,
 *   [key: string]: any
 * }} AuthCredentials
 */

/**
 * @typedef {{
 *   token: string,
 *   user: { [key: string]: any } | null,
 *   [key: string]: any
 * }} AuthResponse
 */

async function getErrorMessage(response, fallbackMessage) {
  const errorBody = await response.json().catch(() => ({}));
  return errorBody.error || fallbackMessage;
}

export const authAPI = {
  signup: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Signup failed"));
    }

    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Login failed"));
    }

    return response.json();
  },

  me: async (token) => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Auth check failed"));
    }

    return response.json();
  },
};