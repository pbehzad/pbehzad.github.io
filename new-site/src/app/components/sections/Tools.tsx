import React from 'react';

const tools = [
  { name: "HARMONARIUM", year: "2024" },
  { name: "OVERTONES LAB", year: "2024" },
  { name: "MAX/MSP PATCHES", year: "ONGOING" },
  { name: "WEB AUDIO TOOLS", year: "ONGOING" },
  { name: "ZSCORE NOTATION", year: "2019-PRESENT" }
];

const Tools: React.FC = () => {
  return (
    <div className="space-y-8 w-full">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight border-b-4 border-white pb-2 inline-block">
          TOOLS
        </h2>
      </div>

      {/* List - Ultra Minimal */}
      <div className="space-y-4 text-sm">
        {tools.map((tool, index) => (
          <div
            key={index}
            className="border-2 border-white p-4 hover:bg-white hover:text-black transition-all duration-100"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black uppercase">
                {tool.name}
              </h3>
              <div className="text-xs font-black">
                {tool.year}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Tools;
