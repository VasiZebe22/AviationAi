import axios from 'axios';
import { auth } from './firebase';

// Create axios instance with default config
const api = axios.create({
    baseURL: '/',
    timeout: 10000
});

// Add a request interceptor
api.interceptors.request.use(async (config) => {
    try {
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    } catch (error) {
        return Promise.reject(error);
    }
}, (error) => {
    return Promise.reject(error);
});

export default api;
