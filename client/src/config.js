export const API_URL = "http://127.0.0.1:8080/api";

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Bearer ${token}`
  };
};
