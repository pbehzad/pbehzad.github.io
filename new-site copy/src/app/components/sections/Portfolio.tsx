import React from 'react';

interface Project {
  id: string;
  category: string;
  title: string;
  year: number;
  instruments?: string;
  description?: string;
  tags: string[];
  showInPortfolio: boolean;
}

const projects: Project[] = [
  {
    id: "comp001",
    category: "Composition",
    title: "overcomplication",
    year: 2025,
    instruments: "piano, midi-keyboard",
    description: null,
    tags: ["Piano Duo", "Ensemble", "keys"],
    showInPortfolio: true
  },
  {
    id: "comp004",
    category: "Composition",
    title: "SIMIYYA",
    year: 2023,
    instruments: "flute, bassoon, bass trombone, 3x double basses",
    description: null,
    tags: ["ensemble", "sextet", "flute", "bassoon", "bass", "trombone", "double bass"],
    showInPortfolio: true
  },
  {
    id: "comp006",
    category: "Composition",
    title: "...where two and two makes up five",
    year: 2022,
    instruments: "ensemble",
    description: null,
    tags: ["ensemble", "viola", "cello", "piano"],
    showInPortfolio: true
  },
  {
    id: "comp008",
    category: "Composition",
    title: "CRUX",
    year: 2021,
    instruments: "fixed media",
    description: null,
    tags: ["electronics", "fixed-media"],
    showInPortfolio: true
  },
  {
    id: "audioprog001",
    category: "Audio Programming",
    title: "Harmonarium",
    year: 2024,
    description: "Interactive web application for exploring just intonation network.",
    tags: ["JavaScript", "Web Audio", "Music Theory", "Tool"],
    showInPortfolio: true
  },
  {
    id: "audioprog002",
    category: "Audio Programming",
    title: "Overtones Lab",
    year: 2024,
    description: "Interactive web application for exploring overtones.",
    tags: ["JavaScript", "Web Audio", "Music Theory", "Tool"],
    showInPortfolio: true
  },
  {
    id: "zscore001",
    category: "Engraving (ZSCORE)",
    title: "IMPACT by Amir Shpilman",
    year: 2024,
    instruments: "Full Orchestra, Choir, 2x Stunt women",
    description: "Detailed score and parts preparation...",
    tags: ["Sibelius", "Notation", "Orchestral"],
    showInPortfolio: true
  }
];

const Portfolio: React.FC = () => {
  const portfolioProjects = projects.filter(project => project.showInPortfolio);

  return (
    <div className="space-y-6 text-center">
      <h2 className="text-xl font-light mb-4 opacity-90">Portfolio</h2>
      <p className="text-sm opacity-70 mb-6">showcase of highlighted works</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {portfolioProjects.slice(0, 6).map((project, index) => (
          <div key={project.id + index} className="border border-white/20 rounded-lg p-6 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all duration-300">
            <div className="space-y-3">
              <div className="font-medium text-lg opacity-90">{project.title}</div>
              <div className="text-sm opacity-70">
                {project.year} | {project.category}
              </div>
              {project.instruments && (
                <div className="text-sm opacity-60 italic">{project.instruments}</div>
              )}
              {project.description && (
                <div className="text-sm opacity-75 mt-3">{project.description}</div>
              )}
              <div className="text-xs opacity-50 mt-3">
                {project.tags.slice(0, 3).join(' • ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;