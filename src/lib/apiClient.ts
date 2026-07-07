import axios from "axios";
import { supabase } from "./supabase";

// Unified API client pointing to the Express backend server port
export const apiClient = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios Request Interceptor to dynamically attach the Supabase session token
apiClient.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.error("Failed to append Supabase access token to request headers:", err);
  }
  return config;
});

export default apiClient;
