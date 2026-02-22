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
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0d0d0d' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm px-8">
        <h1 className="text-xl font-normal mb-8" style={{ color: '#e5e5e5' }}>
          Admin
        </h1>

        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-xs font-normal uppercase tracking-wider" style={{ color: '#888' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className="text-sm font-normal px-3 py-2 rounded outline-none w-full"
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              color: '#e5e5e5',
            }}
          />
        </div>

        {error && (
          <div className="text-sm mb-4 px-3 py-2 rounded" style={{ background: '#2a1010', color: '#f87171', border: '1px solid #5a1a1a' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-sm font-normal px-4 py-2 rounded transition-opacity disabled:opacity-40"
          style={{ background: '#ffffff', color: '#000000' }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
