'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
      } else {
        setError('Invalid password');
      }
    } catch {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-xs">
        <h1 className="text-sm font-normal uppercase tracking-wider opacity-40 mb-8">
          admin
        </h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          autoFocus
          className="w-full bg-transparent border-b border-white/20 text-sm font-normal py-2 outline-none focus:border-white/60 transition-colors placeholder:opacity-30"
        />

        {error && (
          <div className="text-xs font-normal opacity-60 mt-4">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-8 text-xs font-normal uppercase tracking-wider opacity-40 hover:opacity-100 transition-opacity disabled:opacity-20"
        >
          {loading ? '...' : 'enter'}
        </button>
      </form>
    </div>
  );
}
