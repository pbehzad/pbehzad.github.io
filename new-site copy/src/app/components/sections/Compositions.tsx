import React from 'react';

interface Composition {
  id: string;
  category: string;
  title: string;
  year: number;
  instruments?: string;
  description?: string;
  tags: string[];
  status?: string;
  showInPortfolio: boolean;
}

const compositions: Composition[] = [
  {
    id: "comp001",
    category: "Vocal/Electronic",
    title: "One Coming...",
    year: 2025,
    instruments: "voice, live-electronic",
    description: "Exploring the intersection of voice and live electronics in real-time processing.",
    tags: ["Voice", "Live Electronics", "Real-time"],
    status: "work-in-progress",
    showInPortfolio: true
  },
  {
    id: "comp002",
    category: "Chamber Music",
    title: "overcomplication",
    year: 2025,
    instruments: "piano, midi-keyboard",
    description: "A dialogue between acoustic piano and digital keyboard exploring complexity and simplicity.",
    tags: ["Piano Duo", "MIDI", "Acoustic-Digital"],
    showInPortfolio: true
  },
  {
    id: "comp003",
    category: "Ensemble",
    title: "micro-clones",
    year: 2025,
    instruments: "ensemble",
    description: "Small-scale repetitive structures creating larger architectural forms.",
    tags: ["Ensemble", "Minimalism", "Structure"],
    status: "work-in-progress",
    showInPortfolio: true
  },
  {
    id: "comp004",
    category: "Solo/Electronics",
    title: "SHIFTS",
    year: 2025,
    instruments: "double bass, 8 channels live electronics",
    description: "Spatial composition exploring the relationship between acoustic instrument and multichannel electronics.",
    tags: ["Double Bass", "8-Channel", "Spatial Audio"],
    status: "work-in-progress",
    showInPortfolio: true
  },
  {
    id: "comp005",
    category: "Ensemble",
    title: "SIMIYYA",
    year: 2023,
    instruments: "flute, bassoon, bass trombone, 3x double basses",
    description: "Sextet exploring extended techniques and microtonal relationships.",
    tags: ["Sextet", "Extended Techniques", "Microtonality"],
    showInPortfolio: true
  },
  {
    id: "comp006",
    category: "Chamber Music",
    title: "Brahms at the Sewing Machine",
    year: 2023,
    instruments: "viola, cello, piano",
    description: "A reinterpretation of romantic gestures through contemporary lens.",
    tags: ["Piano Trio", "Neo-Romantic", "Chamber"],
    showInPortfolio: true
  },
  {
    id: "comp007",
    category: "Solo/Electronics",
    title: "vestiges",
    year: 2023,
    instruments: "cello, live-electronics",
    description: "Live processing of cello through multichannel diffusion system.",
    tags: ["Cello", "Live Electronics", "Processing"],
    showInPortfolio: true
  },
  {
    id: "comp008",
    category: "Ensemble",
    title: "...where two and two makes up five",
    year: 2022,
    instruments: "ensemble",
    description: "Mathematical impossibilities made audible through instrumental ensemble.",
    tags: ["Ensemble", "Mathematical", "Paradox"],
    showInPortfolio: true
  },
  {
    id: "comp009",
    category: "Electronics",
    title: "CRUX",
    year: 2021,
    instruments: "fixed media",
    description: "Fixed media composition exploring critical moments and transitions.",
    tags: ["Fixed Media", "Electroacoustic", "Transitions"],
    showInPortfolio: true
  }
];

const Compositions: React.FC = () => {
  const portfolioCompositions = compositions.filter(comp => comp.showInPortfolio);

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-3xl font-light mb-8 opacity-90">Compositions</h2>
      <p className="text-lg opacity-70 mb-6">Contemporary works spanning acoustic, electronic, and hybrid media</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {portfolioCompositions.slice(0, 6).map((comp, index) => (
          <div key={comp.id + index} className="border border-white/20 rounded-lg p-6 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300">
            <div className="space-y-3">
              <div className="font-medium text-lg opacity-90 flex items-center gap-2">
                {comp.title}
                {comp.status && (
                  <span className="text-xs opacity-60 italic bg-white/10 px-2 py-1 rounded">
                    {comp.status}
                  </span>
                )}
              </div>
              <div className="text-sm opacity-70">
                {comp.year} | {comp.category}
              </div>
              {comp.instruments && (
                <div className="text-sm opacity-60 italic">{comp.instruments}</div>
              )}
              {comp.description && (
                <div className="text-sm opacity-75 mt-3">{comp.description}</div>
              )}
              <div className="text-xs opacity-50 mt-3">
                {comp.tags.slice(0, 3).join(' • ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Compositions;