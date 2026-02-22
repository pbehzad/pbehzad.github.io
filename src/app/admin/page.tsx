'use client';

import React, { useEffect, useState } from 'react';

interface Stats {
  compositions: number;
  events: { total: number; upcoming: number; past: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/compositions').then(r => r.json()),
      fetch('/api/admin/events').then(r => r.json()),
    ]).then(([compositions, events]) => {
      const now = new Date();
      const upcoming = events.filter((e: { date: string }) => new Date(e.date) >= now);
      const past = events.filter((e: { date: string }) => new Date(e.date) < now);

      setStats({
        compositions: compositions.length,
        events: { total: events.length, upcoming: upcoming.length, past: past.length },
      });
    });
  }, []);

  return (
    <div>
      <h1 className="text-lg font-normal mb-8" style={{ color: '#e5e5e5' }}>
        Dashboard
      </h1>

      {stats ? (
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: stats.compositions, label: 'Compositions' },
            { value: stats.events.upcoming, label: 'Upcoming Events' },
            { value: stats.events.past, label: 'Past Events' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded"
              style={{ background: '#151515', border: '1px solid #222' }}
            >
              <div className="text-3xl font-normal mb-1" style={{ color: '#fff' }}>{stat.value}</div>
              <div className="text-xs font-normal uppercase tracking-wider" style={{ color: '#555' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm" style={{ color: '#555' }}>Loading…</div>
      )}
    </div>
  );
}
