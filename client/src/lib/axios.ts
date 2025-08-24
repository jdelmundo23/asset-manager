import axios from "axios";
import { getServerUrl } from "./utils";

const serverUrl = getServerUrl();

const axiosApi = axios.create({
  baseURL: serverUrl,
  withCredentials: true,
});

axiosApi.interceptors.request.use((config) => {
  if (serverUrl === window.location.origin) {
    return Promise.reject(
      new Error(
        "VITE_BACKEND_URL is misconfigured: it points to the frontend origin."
      )
    );
  }
  return config;
});

export default axiosApi;
