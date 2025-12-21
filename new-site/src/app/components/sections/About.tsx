'use client';

import React from 'react';
import { useProfile } from '@/services/hooks/useContent';

const About: React.FC = () => {
  const { profile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="space-y-8 w-full text-center">
        <div className="text-sm font-bold uppercase opacity-70">LOADING...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-8 w-full text-center">
        <div className="text-sm font-bold uppercase text-red-500">ERROR LOADING PROFILE</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full text-center">

      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight border-b-4 border-white pb-2 inline-block">
          ABOUT
        </h2>
      </div>

      {/* Content - Minimal */}
      <div className="space-y-6 text-sm md:text-base max-w-2xl mx-auto">
        <p className="font-bold uppercase leading-relaxed">
          {profile.bio}
        </p>

        <div className="w-16 h-1 bg-white mx-auto" />

        <div className="border-2 border-white p-6">
          <div className="space-y-3 text-xs font-bold uppercase">
            {profile.specializations.map((spec, i) => (
              <div key={i}>{spec}</div>
            ))}
          </div>
        </div>

        {profile.skills.map((skillGroup, i) => (
          <div key={i} className="border-2 border-white p-6">
            <div className="space-y-3 text-xs font-bold uppercase">
              {skillGroup.items.map((skill, j) => (
                <div key={j}>{skill}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default About;
