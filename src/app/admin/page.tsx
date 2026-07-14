'use client';

import React, { useEffect, useState } from 'react';

interface Stats {
  compositions: number;
  texts: number;
  tools: number;
  events: { total: number; upcoming: number; past: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/compositions').then(r => r.json()),
      fetch('/api/admin/events').then(r => r.json()),
      fetch('/api/admin/texts').then(r => r.json()),
      fetch('/api/admin/tools').then(r => r.json()),
    ]).then(([compositions, events, texts, tools]) => {
      const now = new Date();
      const upcoming = events.filter((e: { date: string }) => new Date(e.date) >= now);
      const past = events.filter((e: { date: string }) => new Date(e.date) < now);

      setStats({
        compositions: compositions.length,
        texts: texts.length,
        tools: tools.length,
        events: { total: events.length, upcoming: upcoming.length, past: past.length },
      });
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1>Overview</h1>
        <p className="mt-1.5 text-sm" style={{ color: '#77766f' }}>A quick view of the content currently managed by the site.</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {[
            { value: stats.compositions, label: 'Compositions' },
            { value: stats.events.upcoming, label: 'Upcoming Events' },
            { value: stats.events.past, label: 'Past Events' },
            { value: stats.texts, label: 'Texts' },
            { value: stats.tools, label: 'Tools' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border p-5"
              style={{ background: '#fbfaf7', borderColor: '#dcdad2', boxShadow: '0 8px 28px rgb(37 36 31 / 0.035)' }}
            >
              <div className="mb-5 text-3xl font-medium tracking-tight" style={{ color: '#1d1d1a' }}>{stat.value}</div>
              <div className="text-xs font-medium" style={{ color: '#77766f' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm" style={{ color: '#555' }}>Loading…</div>
      )}
    </div>
  );
}
