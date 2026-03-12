import axios from "axios";

const getBackendUrl = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:8000/api`;
};

const api = axios.create({
  baseURL: getBackendUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const tokens = localStorage.getItem("tokens");
  if (tokens) {
    const { access } = JSON.parse(tokens);
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tokens");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
