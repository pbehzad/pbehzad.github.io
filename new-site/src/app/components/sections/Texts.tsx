import React from 'react';

interface Text {
  title: string;
  year: number;
  type: string;
}

const texts: Text[] = [
  {
    title: "ON POST-HEIDEGGERIAN AESTHETICS IN MUSIC",
    year: 2023,
    type: "ESSAY"
  },
  {
    title: "CIRCULAR TEMPORALITIES IN ELECTROACOUSTIC COMPOSITION",
    year: 2022,
    type: "ARTICLE"
  },
  {
    title: "NOTATION AS INTERFACE: RETHINKING SCORE-BASED COMPOSITION",
    year: 2021,
    type: "ESSAY"
  }
];

const Texts: React.FC = () => {
  return (
    <div className="space-y-8 w-full">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight border-b-4 border-white pb-2 inline-block">
          TEXTS
        </h2>
      </div>

      {/* List - Ultra Minimal */}
      <div className="space-y-4 text-sm">
        {texts.map((text, index) => (
          <div
            key={index}
            className="border-2 border-white p-4 hover:bg-white hover:text-black transition-all duration-100"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-base font-black uppercase leading-tight flex-1">
                {text.title}
              </h3>
            </div>
            <div className="text-xs font-bold uppercase opacity-70">
              {text.year} • {text.type}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Texts;
