'use client';

import React from 'react';
import { useTexts } from '@/services/hooks/useContent';

const Texts: React.FC = () => {
  const { texts, loading, error } = useTexts();

  if (loading) {
    return (
      <div className="space-y-8 w-full text-center">
        <div className="text-sm font-bold uppercase opacity-70">LOADING...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 w-full text-center">
        <div className="text-sm font-bold uppercase text-red-500">ERROR LOADING TEXTS</div>
      </div>
    );
  }

  // Enable scroll for lists with more than 4 items
  const needsScroll = texts.length > 4;

  return (
    <div className="space-y-8 w-full">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight border-b-4 border-white pb-2 inline-block">
          TEXTS
        </h2>
      </div>

      {/* List - Ultra Minimal - Shows ~7 items in viewport */}
      <div
        className={`space-y-4 text-sm ${needsScroll ? 'max-h-[300px] overflow-y-auto brutalist-scroll pr-2' : ''}`}
        data-scrollable-section={needsScroll}
      >
        {texts.map((text) => (
          <div
            key={text.id}
            className="border-2 border-white p-4 hover:bg-white hover:text-black transition-all duration-100"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-black uppercase leading-tight flex-1">
                {text.title}
              </h3>
            </div>
            <div className="text-xs font-bold uppercase opacity-70">
              {text.year} • {text.type.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Texts;
