'use client';

import React from 'react';
import { useCompositions } from '@/services/hooks/useContent';

const Compositions: React.FC = () => {
  const { compositions, loading, error } = useCompositions();

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
        <div className="text-sm font-bold uppercase text-red-500">ERROR LOADING COMPOSITIONS</div>
      </div>
    );
  }
  // Enable scroll for lists with more than 4 items
  const needsScroll = compositions.length > 4;

  return (
    <div className="space-y-8 w-full">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight border-b-4 border-white pb-2 inline-block">
          COMPOSITIONS
        </h2>
      </div>

      {/* List - Ultra Minimal - Shows ~7 items in viewport */}
      <div
        className={`space-y-4 text-sm ${needsScroll ? 'max-h-[300px] overflow-y-auto brutalist-scroll pr-2' : ''}`}
        data-scrollable-section={needsScroll}
      >
        {compositions.map((comp) => (
          <div
            key={comp.id}
            className="border-2 border-white p-4 hover:bg-white hover:text-black transition-all duration-100"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-black uppercase leading-tight flex-1">
                {comp.title}
              </h3>
              <div className="text-xs font-black ml-4">
                {comp.year}
              </div>
            </div>
            <div className="text-xs font-bold uppercase opacity-70">
              {comp.instruments}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Compositions;
