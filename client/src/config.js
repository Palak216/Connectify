
export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8080/api";

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://127.0.0.1:8080";

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};
