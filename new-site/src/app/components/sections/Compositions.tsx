import React from 'react';

interface Composition {
  title: string;
  year: number;
  instruments: string;
}

const compositions: Composition[] = [
  {
    title: "ONE COMING...",
    year: 2025,
    instruments: "VOICE, LIVE-ELECTRONIC"
  },
  {
    title: "OVERCOMPLICATION",
    year: 2025,
    instruments: "PIANO, MIDI-KEYBOARD"
  },
  {
    title: "MICRO-CLONES",
    year: 2025,
    instruments: "ENSEMBLE"
  },
  {
    title: "SHIFTS",
    year: 2025,
    instruments: "DOUBLE BASS, 8CH ELECTRONICS"
  },
  {
    title: "SIMIYYA",
    year: 2023,
    instruments: "SEXTET"
  },
  {
    title: "BRAHMS AT THE SEWING MACHINE",
    year: 2023,
    instruments: "VIOLA, CELLO, PIANO"
  }
];

const Compositions: React.FC = () => {
  return (
    <div className="space-y-8 w-full">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight border-b-4 border-white pb-2 inline-block">
          COMPOSITIONS
        </h2>
      </div>

      {/* List - Ultra Minimal */}
      <div className="space-y-4 text-sm">
        {compositions.map((comp, index) => (
          <div
            key={index}
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
