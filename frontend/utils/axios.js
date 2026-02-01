import axios from "axios";

const api = axios.create({
    // Ensure this matches your backend port (usually 5000 or 8000)
    baseURL: import.meta.env.VITE_API_BASE_URL, 
    withCredentials: true,
});

export default api;