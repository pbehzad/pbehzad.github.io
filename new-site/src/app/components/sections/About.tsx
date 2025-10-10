import React from 'react';

const About: React.FC = () => {
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
          ACOUSTIC COMPOSITION, LIVE ELECTRONICS, AUDIO PROGRAMMING,
          AND THEORETICAL RESEARCH INTO POST-HEIDEGGERIAN AESTHETICS
        </p>

        <div className="w-16 h-1 bg-white mx-auto" />

        <div className="border-2 border-white p-6">
          <div className="space-y-3 text-xs font-bold uppercase">
            <div>COMPOSITION</div>
            <div>AUDIO PROGRAMMING</div>
            <div>MUSIC ENGRAVING</div>
            <div>THEORETICAL RESEARCH</div>
          </div>
        </div>

        <div className="border-2 border-white p-6">
          <div className="space-y-3 text-xs font-bold uppercase">
            <div>MAX/MSP</div>
            <div>JAVASCRIPT</div>
            <div>SIBELIUS</div>
            <div>REAPER</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
