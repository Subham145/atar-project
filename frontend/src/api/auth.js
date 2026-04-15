const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

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

/**
 * @param {Response} response
 * @param {string} fallbackMessage
 */
async function getErrorMessage(response, fallbackMessage) {
  const errorBody = await response.json().catch(() => ({}));
  return errorBody.error || fallbackMessage;
}

export const authAPI = {
  /**
   * @param {AuthCredentials} credentials
   * @returns {Promise<AuthResponse>}
   */
  signup: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Signup failed"));
    }
    return /** @type {Promise<AuthResponse>} */ (response.json());
  },
  /**
   * @param {AuthCredentials} credentials
   * @returns {Promise<AuthResponse>}
   */
  login: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Login failed"));
    }
    return /** @type {Promise<AuthResponse>} */ (response.json());
  },
  /**
   * @param {AuthCredentials} credentials
   * @returns {Promise<AuthResponse>}
   */
  register: async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Registration failed"));
    }
    return /** @type {Promise<AuthResponse>} */ (response.json());
  },
  /**
   * @param {string} token
   * @returns {Promise<{ [key: string]: any }>}
   */
  me: async (token) => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Auth check failed"));
    }
    return /** @type {Promise<{ [key: string]: any }>} */ (response.json());
  },
};
