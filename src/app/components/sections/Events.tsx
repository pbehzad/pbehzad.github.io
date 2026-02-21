'use client';

import React from 'react';
import { useEvents } from '@/services/hooks/useContent';

const Events: React.FC = () => {
  const { events, loading, error } = useEvents();

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
        <div className="text-sm font-normal uppercase opacity-40">error loading events</div>
      </div>
    );
  }

  const upcoming = events.filter(e => new Date(e.date) >= new Date());
  const past = events.filter(e => new Date(e.date) < new Date());

  return (
    <div className="w-full">

      <div className="sticky top-0 z-10 bg-black h-[15vh] md:h-[25vh] flex items-end">
        <h1 className="text-3xl md:text-6xl font-bold uppercase tracking-tight">
          Events
        </h1>
      </div>

      {upcoming.length > 0 && (
        <>
          <div className="pt-8 md:pt-12 pl-4 md:pl-32">
            <span className="text-xs font-normal uppercase opacity-40">upcoming</span>
          </div>
          <div className="flex flex-col gap-6 pt-6 pl-4 md:pl-32">
            {upcoming.map((event) => (
              <div key={event.id} className="cursor-pointer hover:opacity-60 transition-opacity">
                <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-0">
                  <span className="inline-block py-1 text-base md:text-lg font-normal leading-tight md:w-[600px] md:ml-[-100px]">
                    {event.title}
                  </span>
                  <span className="text-xs font-normal opacity-40 shrink-0">
                    {event.date}
                  </span>
                </div>
                <div className="text-xs font-normal opacity-30 mt-0.5 md:ml-[-100px]">
                  {event.venue}, {event.city}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <div style={{ height: '100px' }} />
          <div className="pl-4 md:pl-32">
            <span className="text-xs font-normal uppercase opacity-40">past</span>
          </div>
          <div className="flex flex-col gap-6 pt-6 pl-4 md:pl-32">
            {past.map((event) => (
              <div key={event.id} className="cursor-pointer hover:opacity-60 transition-opacity">
                <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-0">
                  <span className="inline-block py-1 text-base md:text-lg font-normal leading-tight opacity-50 md:w-[600px] md:ml-[-100px]">
                    {event.title}
                  </span>
                  <span className="text-xs font-normal opacity-30 shrink-0">
                    {event.date}
                  </span>
                </div>
                <div className="text-xs font-normal opacity-20 mt-0.5 md:ml-[-100px]">
                  {event.venue}, {event.city}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
};

export default Events;
