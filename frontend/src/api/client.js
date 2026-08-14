import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const client = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let unauthorizedHandler = null;

/**
 * Registers a callback invoked whenever the API responds with 401 Unauthorized.
 * AuthContext uses this to clear client-side user state and redirect to /login.
 */
export function setOnUnauthorized(handler) {
  unauthorizedHandler = handler;
}

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (unauthorizedHandler) {
        unauthorizedHandler();
      } else if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
