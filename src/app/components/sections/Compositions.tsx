'use client';

import React from 'react';
import { useCompositions } from '@/services/hooks/useContent';

const Compositions: React.FC = () => {
  const { compositions, loading, error } = useCompositions();

  if (loading) {
    return (
      <div className="w-full pt-8">
        <div className="text-sm font-normal uppercase opacity-40">loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pt-8">
        <div className="text-sm font-normal uppercase opacity-40">error loading compositions</div>
      </div>
    );
  }

  return (
    <div className="w-full">

      <div className="sticky top-0 z-10 bg-black h-[15vh] md:h-[25vh] flex items-end">
        <h1 className="text-3xl md:text-6xl font-bold uppercase tracking-tight">
          Compositions
        </h1>
      </div>

      <div className="flex flex-col gap-6 pt-8 md:pt-12 pl-4 md:pl-32">
        {compositions.map((comp) => (
          <a
            key={comp.id}
            href={`/compositions/${comp.slug}`}
            className="block cursor-pointer hover:opacity-60 transition-opacity"
          >
            <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-0">
              <span className="inline-block py-1 text-base md:text-lg font-normal leading-tight md:w-[600px] md:ml-[-100px]">
                {comp.title}
              </span>
              <span className="text-xs font-normal opacity-40 shrink-0">
                {comp.year.substring(0, 4)}
              </span>
            </div>
            <div className="text-xs font-normal opacity-30 mt-0.5 md:ml-[-100px]">
              {comp.instruments}
            </div>
          </a>
        ))}
      </div>

    </div>
  );
};

export default Compositions;
