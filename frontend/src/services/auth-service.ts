import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const authService = {
  async register(data: { name: string; email: string; password: string }) {
    const response = await axios.post(`${API_URL}/auth/register`, data);
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await axios.post(`${API_URL}/auth/login`, data);
    return response.data; 
  },
};