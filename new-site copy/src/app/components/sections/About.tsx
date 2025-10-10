import React from 'react';

const About: React.FC = () => {
  return (
    <div className="space-y-10 text-center w-full">
      <h2 className="text-3xl font-light mb-8 opacity-90">About</h2>
      <div className="space-y-8 text-lg leading-relaxed max-w-4xl mx-auto">
        <p className="opacity-85 font-light">
          My work spans acoustic composition, live electronics, audio programming, 
          and theoretical research into post-Heideggerian aesthetics.
        </p>
        <p className="opacity-80 font-light">
          Currently based between research and practice, I develop tools and 
          compositions that question traditional boundaries in contemporary music.
        </p>
        <div className="mt-10 pt-6 border-t border-white/20 text-base opacity-70 space-y-4">
          <div>Specialties: Composition, Audio Programming, Music Engraving</div>
          <div>Tools: Max/MSP, JavaScript, Sibelius, Reaper</div>
        </div>
      </div>
    </div>
  );
};

export default About;