'use client';

import React from 'react';
import { useProfile } from '@/services/hooks/useContent';

const About: React.FC = () => {
  const { profile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="w-full pt-8">
        <div className="text-sm font-normal uppercase opacity-40">loading...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full pt-8">
        <div className="text-sm font-normal uppercase opacity-40">error loading profile</div>
      </div>
    );
  }

  return (
    <div className="w-full">

      <div className="sticky top-0 z-10 bg-black h-[15vh] md:h-[25vh] flex items-end">
        <h1 className="text-3xl md:text-6xl font-bold uppercase tracking-tight">
          About
        </h1>
      </div>

      <div className="pt-8 md:pt-12 pl-4 md:pl-32">
        <p className="text-sm font-normal leading-relaxed max-w-lg opacity-80">
          {profile.bio}
        </p>

        <div className="mt-12 md:mt-16 flex flex-col gap-8">
          <div>
            <h3 className="text-xs font-normal uppercase opacity-40 mb-4">specializations</h3>
            <div className="flex flex-col gap-2">
              {profile.specializations.map((spec, i) => (
                <span key={i} className="text-sm font-normal">{spec}</span>
              ))}
            </div>
          </div>

          {profile.skills.map((skillGroup, i) => (
            <div key={i}>
              <h3 className="text-xs font-normal uppercase opacity-40 mb-4">{skillGroup.category}</h3>
              <div className="flex flex-col gap-2">
                {skillGroup.items.map((skill, j) => (
                  <span key={j} className="text-sm font-normal">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default About;
