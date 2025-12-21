'use client';

import React from 'react';
import { useHomeContent } from '@/services/hooks/useContent';

const Home: React.FC = () => {
  const { home, loading, error } = useHomeContent();

  if (loading) {
    return (
      <div className="space-y-8 w-full text-center">
        <div className="text-sm font-bold uppercase opacity-70">LOADING...</div>
      </div>
    );
  }

  if (error || !home) {
    return (
      <div className="space-y-8 w-full text-center">
        <div className="text-sm font-bold uppercase text-red-500">ERROR LOADING HOME</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full text-center">

      {/* Hero - Ultra Minimal */}
      <div className="space-y-6">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-wider uppercase">
          {home.hero.name}
        </h1>
        <div className="w-16 h-1 bg-white mx-auto" />
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight uppercase opacity-80">
          {home.hero.title}<br/>
          {home.hero.subtitle}
        </h2>
        <p className="text-sm md:text-base font-bold uppercase tracking-wide opacity-70">
          {home.hero.tagline}
        </p>
      </div>

      {/* Recent Works - Minimal List */}
      <div className="space-y-4 mt-12">
        <h3 className="text-lg font-black uppercase tracking-wider border-b-2 border-white pb-2 inline-block">
          RECENT WORKS
        </h3>

        <div className="space-y-2 text-sm">
          {home.recent_works.map((work, i) => (
            <div key={i} className="font-bold uppercase tracking-wide">
              {work.title} ({work.year})
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;
