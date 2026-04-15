import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "https://atar-1.onrender.com";

/**
 * @typedef {{
 *   error?: string
 * }} ApiErrorResponse
 */

/**
 * @typedef {{
 *   file: File
 * }} UploadParams
 */

/**
 * @typedef {{
 *   _id?: string,
 *   id?: string,
 *   customer_name?: string,
 *   registration_number?: string,
 *   policy_number?: string,
 *   insurance_company_name?: string,
 *   lob?: string,
 *   location?: string,
 *   vehicle_make?: string,
 *   vehicle_model?: string,
 *   total_premium?: string | number,
 *   revenue?: string | number,
 *   payment_status?: string,
 *   createdAt?: string,
 *   [key: string]: any
 * }} InsurancePolicy
 */

/**
 * @param {unknown} error
 * @param {string} fallbackMessage
 */
function getApiErrorMessage(error, fallbackMessage) {
  if (axios.isAxiosError(error)) {
    const data = /** @type {ApiErrorResponse | string | undefined} */ (
      error.response?.data
    );

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data && typeof data === "object" && "error" in data && data.error) {
      return data.error;
    }
  }

  return fallbackMessage;
}

function getAuthHeaders(additionalHeaders = {}) {
  const token = localStorage.getItem("token");

  return {
    ...additionalHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const base44 = {
  integrations: {
    Core: {
      /**
       * @param {UploadParams} params
       * @returns {Promise<{ [key: string]: any }>}
       */
      async UploadFile(params) {
        const { file } = params;
        const formData = new FormData();
        formData.append("file", file);

        try {
          const response = await axios.post(
            `${API_BASE_URL}/convert`,
            formData,
            {
              headers: getAuthHeaders({
                "Content-Type": "multipart/form-data",
              }),
            }
          );
          return response.data;
        } catch (error) {
          console.error("Axios Error:", error);
          throw new Error(getApiErrorMessage(error, "Backend connection failed"));
        }
      },
    },
  },
  entities: {
    InsurancePolicy: {
      /**
       * @param {string} [sort="-createdAt"]
       * @param {number} [limit=500]
       * @returns {Promise<InsurancePolicy[]>}
       */
      async list(sort = "-createdAt", limit = 500) {
        try {
          const params = new URLSearchParams({ sort, limit: String(limit) });
          const response = await axios.get(
            `${API_BASE_URL}/policies?${params}`,
            { headers: getAuthHeaders() }
          );
          return /** @type {InsurancePolicy[]} */ (response.data);
        } catch (error) {
          console.error("List policies error:", error);
          throw new Error(getApiErrorMessage(error, "Failed to list policies"));
        }
      },
      /**
       * @param {InsurancePolicy} data
       * @returns {Promise<InsurancePolicy>}
       */
      async create(data) {
        try {
          const response = await axios.post(`${API_BASE_URL}/policies`, data, {
            headers: getAuthHeaders(),
          });
          return /** @type {InsurancePolicy} */ (response.data);
        } catch (error) {
          console.error("Save policy error:", error);
          throw new Error(getApiErrorMessage(error, "Failed to save policy"));
        }
      },
      /**
       * @param {string} id
       * @returns {Promise<{ [key: string]: any }>}
       */
      async delete(id) {
        try {
          const response = await axios.delete(`${API_BASE_URL}/policies/${id}`, {
            headers: getAuthHeaders(),
          });
          return response.data;
        } catch (error) {
          console.error("Delete policy error:", error);
          throw new Error(getApiErrorMessage(error, "Failed to delete policy"));
        }
      },
    },
  },
};
