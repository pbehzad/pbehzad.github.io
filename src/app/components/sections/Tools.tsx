'use client';

import React from 'react';
import { useTools } from '@/services/hooks/useContent';

const Tools: React.FC = () => {
  const { tools, loading, error } = useTools();

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
        <div className="text-sm font-bold uppercase text-red-500">ERROR LOADING TOOLS</div>
      </div>
    );
  }

  // Enable scroll for lists with more than 4 items
  const needsScroll = tools.length > 4;

  return (
    <div className="space-y-8 w-full">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight border-b-4 border-white pb-2 inline-block">
          TOOLS
        </h2>
      </div>

      {/* List - Ultra Minimal - Shows ~7 items in viewport */}
      <div
        className={`space-y-4 text-sm ${needsScroll ? 'max-h-[300px] overflow-y-auto brutalist-scroll pr-2' : ''}`}
        data-scrollable-section={needsScroll}
      >
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="border-2 border-white p-4 hover:bg-white hover:text-black transition-all duration-100"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black uppercase">
                {tool.name}
              </h3>
              <div className="text-xs font-black">
                {tool.year}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Tools;
