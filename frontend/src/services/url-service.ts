import axios from 'axios';
import { URL, Analytics } from '../types/url';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const urlService = {
  async shortenURL(longUrl: string, customSlug?: string): Promise<{ shortUrl: string; slug: string }> {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/api/urls/shorten`,
        {
          longUrl,
          customSlug
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error shortening URL:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to shorten URL');
      }
      throw new Error('Failed to shorten URL');
    }
  },

  async getAllUrls(): Promise<URL[]> {
    try {
      const response = await axios.get(`${API_URL}/api/urls`);
      return response.data;
    } catch (error) {
      console.error('Error fetching URLs:', error);
      throw new Error('Failed to fetch URLs');
    }
  },

  async getMyUrls(): Promise<URL[]> {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

    try {
      const response = await axios.get(
        `${API_URL}/api/urls`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Response:', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching user URLs:', error);
      throw new Error('Failed to fetch user URLs');
    }
  },

  async getUrlById(id: string): Promise<URL> {
    try {
      const response = await axios.get(`${API_URL}/api/urls/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching URL:', error);
      throw new Error('Failed to fetch URL');
    }
  },

  async updateUrlSlug(oldSlug: string, newSlug: string): Promise<URL> {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(`${API_URL}/api/urls/${oldSlug}`,
        {
          newSlug
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        });
      return response.data;
    } catch (error) {
      console.error('Error updating URL slug:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to update slug');
      }
      throw new Error('Failed to update slug');
    }
  },

  async getUrlAnalytics(slug: string): Promise<Analytics> {
    try {
      const response = await axios.get(`${API_URL}/api/analytics/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching URL analytics:', error);
      throw new Error('Failed to fetch URL analytics');
    }
  }
};