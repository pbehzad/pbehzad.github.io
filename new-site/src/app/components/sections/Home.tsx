import React from 'react';

const Home: React.FC = () => {
  return (
    <div className="space-y-8 w-full text-center">

      {/* Hero - Ultra Minimal */}
      <div className="space-y-6">
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight uppercase">
          COMPOSER<br/>
          DEVELOPER
        </h2>
        <div className="w-16 h-1 bg-white mx-auto" />
        <p className="text-sm md:text-base font-bold uppercase tracking-wide">
          MUSIC × PHILOSOPHY × TECHNOLOGY
        </p>
      </div>

      {/* Recent Works - Minimal List */}
      <div className="space-y-4 mt-12">
        <h3 className="text-lg font-black uppercase tracking-wider border-b-2 border-white pb-2 inline-block">
          RECENT WORKS
        </h3>

        <div className="space-y-2 text-sm">
          {[
            'ONE COMING... (2025)',
            'OVERCOMPLICATION (2025)',
            'MICRO-CLONES (2025)',
            'SHIFTS (2025)'
          ].map((work, i) => (
            <div key={i} className="font-bold uppercase tracking-wide">
              {work}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;
