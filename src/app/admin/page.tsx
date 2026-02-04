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
      <h1 className="text-xs font-normal uppercase tracking-wider opacity-40 mb-8">
        Dashboard
      </h1>

      {stats ? (
        <div className="flex gap-12">
          <div>
            <div className="text-3xl font-normal">{stats.compositions}</div>
            <div className="text-xs font-normal opacity-30 mt-1">compositions</div>
          </div>
          <div>
            <div className="text-3xl font-normal">{stats.events.upcoming}</div>
            <div className="text-xs font-normal opacity-30 mt-1">upcoming events</div>
          </div>
          <div>
            <div className="text-3xl font-normal">{stats.events.past}</div>
            <div className="text-xs font-normal opacity-30 mt-1">past events</div>
          </div>
        </div>
      ) : (
        <div className="text-sm font-normal opacity-30">loading...</div>
      )}
    </div>
  );
}
