import React from 'react';

interface Text {
  title: string;
  year: number;
  type: string;
  publication: string;
  description: string;
  tags: string[];
}

const texts: Text[] = [
  {
    title: "On Post-Heideggerian Aesthetics in Music",
    year: 2023,
    type: "Essay",
    publication: "Unpublished Thesis",
    description: "An exploration of Object-Oriented Ontology and its implications for contemporary musical aesthetics.",
    tags: ["Philosophy", "Aesthetics", "OOO", "Heidegger", "Music Theory"]
  },
  {
    title: "Circular Temporalities in Electroacoustic Composition",
    year: 2022,
    type: "Article",
    publication: "Conference Proceedings",
    description: "Analysis of non-linear temporal structures in live electronic music performance.",
    tags: ["Electroacoustic", "Time", "Performance", "Technology"]
  },
  {
    title: "Notation as Interface: Rethinking Score-Based Composition",
    year: 2021,
    type: "Essay",
    publication: "Online Publication",
    description: "Examining the role of traditional notation in contemporary composition practice.",
    tags: ["Notation", "Interface", "Composition", "Technology"]
  }
];

const Texts: React.FC = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold mb-4">TEXTS</h2>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {texts.map((text, index) => (
          <div key={index} className="border-l-2 border-blue-400/30 pl-3">
            <div className="text-sm">
              <div className="font-semibold">{text.title}</div>
              <div className="text-xs opacity-75">
                {text.year} | {text.type} | {text.publication}
              </div>
              <div className="text-xs opacity-80 mt-1 leading-relaxed">
                {text.description}
              </div>
              <div className="text-xs opacity-50 mt-1">
                {text.tags.slice(0, 4).join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Texts;