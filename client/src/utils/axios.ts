import axios from "axios";
import { BASE_URL } from "../lib/apis";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: `${BASE_URL}`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 &&
      !window.location.pathname.startsWith("/auth")
    ) {
      toast.error("Session expired. Please sign in again.");
      setTimeout(() => {
        window.location.href = "/auth/signin";
      }, 500);
    }

    return Promise.reject(error);
  }
);

export default api;
