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
    <div className="admin-login fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: '#f2f1ed' }}>
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl border p-7" style={{ background: '#fbfaf7', borderColor: '#dcdad2', boxShadow: '0 20px 60px rgb(37 36 31 / 0.08)' }}>
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg text-xs font-bold" style={{ background: '#20201d', color: '#fff' }}>PB</span>
          <div><h1 className="!text-lg">Welcome back</h1><p className="mt-0.5 text-xs" style={{ color: '#77766f' }}>Sign in to manage your site.</p></div>
        </div>

        <div className="admin-field mb-4">
          <label className="admin-field-label">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className="admin-control"
          />
        </div>

        {error && (
          <div className="admin-notice admin-notice-error mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="admin-button admin-button-primary w-full disabled:opacity-40"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
