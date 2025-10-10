'use client';

import React, { useState } from 'react';
import Portal from './components/TerminalPortal';

export default function Home() {
  const [currentSection, setCurrentSection] = useState('home');

  const handleNavigation = (section: string) => {
    setCurrentSection(section);
  };

  return (
    <div className="min-h-screen bg-black relative">
      <Portal onNavigate={handleNavigation} />
    </div>
  );
}
