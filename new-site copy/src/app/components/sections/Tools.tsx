import React from 'react';

const Tools: React.FC = () => {
  const tools = [
    {
      category: "Audio Programming",
      items: [
        { name: "Harmonarium", description: "Just intonation network explorer", year: 2024 },
        { name: "Overtones Lab", description: "Interactive overtone analyzer", year: 2024 }
      ]
    },
    {
      category: "Development Tools",
      items: [
        { name: "Custom Max/MSP patches", description: "Live electronics processing", year: "ongoing" },
        { name: "Web Audio experiments", description: "Browser-based audio tools", year: "ongoing" }
      ]
    },
    {
      category: "Engraving Services",
      items: [
        { name: "ZSCORE", description: "Professional music notation", year: "2019-present" },
        { name: "Score preparation", description: "Parts extraction and formatting", year: "ongoing" }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold mb-4">TOOLS</h2>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {tools.map((category, categoryIndex) => (
          <div key={categoryIndex} className="space-y-2">
            <h3 className="text-sm font-semibold opacity-80">{category.category}</h3>
            <div className="space-y-2 pl-3 border-l-2 border-white/20">
              {category.items.map((tool, toolIndex) => (
                <div key={toolIndex} className="text-xs">
                  <div className="font-medium">{tool.name}</div>
                  <div className="opacity-75">{tool.description}</div>
                  <div className="opacity-50">{tool.year}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tools;