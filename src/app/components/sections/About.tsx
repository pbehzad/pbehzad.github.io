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

        {profile.html_content && (
          <div
            className="mt-12 prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: profile.html_content }}
          />
        )}
      </div>

    </div>
  );
};

export default About;
