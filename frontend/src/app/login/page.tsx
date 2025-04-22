'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { authService } from '@/services/auth-service';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { access_token } = await authService.login(form);
      localStorage.setItem('token', access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-950">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-blue-950 shadow p-6 rounded"
      >
        <h2 className="text-2xl font-bold mb-4 text-yellow-500">Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <label className="block mb-2 text-yellow-500">
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full border-white border-2 rounded p-2"
          />
        </label>
        <label className="block mb-4 text-yellow-500">
          Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 block w-full border-white border-2 rounded p-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 text-blue-950 py-2 rounded hover:bg-yellow-600 transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
