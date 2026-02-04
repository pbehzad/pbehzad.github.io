'use client';

import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6">
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-wider uppercase">
          PARHAM BEHZAD
        </h1>
        <div className="w-24 h-1 bg-white mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight uppercase opacity-90">
            COMPOSER
          </h2>
          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight uppercase opacity-90">
            DEVELOPER
          </h2>
        </div>
        <p className="text-sm md:text-lg font-bold uppercase tracking-widest opacity-70 pt-4">
          MUSIC × PHILOSOPHY × TECHNOLOGY
        </p>
      </div>
    </div>
  );
};

export default Home;
