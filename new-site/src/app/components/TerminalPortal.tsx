'use client';

import React, { useState, useEffect } from 'react';
import Home from './sections/Home';
import Compositions from './sections/Compositions';
import Texts from './sections/Texts';
import Tools from './sections/Tools';
import About from './sections/About';
import Contact from './sections/Contact';

interface PortalProps {
  onNavigate?: (section: string) => void;
}

const Portal: React.FC<PortalProps> = ({ onNavigate }) => {
  const [scrollDepth, setScrollDepth] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [isPortrait, setIsPortrait] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const sections = [
    {
      id: 'home',
      label: 'HOME',
      component: <Home />,
      index: '01'
    },
    {
      id: 'compositions',
      label: 'COMPOSITIONS',
      component: <Compositions />,
      index: '02'
    },
    {
      id: 'texts',
      label: 'TEXTS',
      component: <Texts />,
      index: '03'
    },
    {
      id: 'tools',
      label: 'TOOLS',
      component: <Tools />,
      index: '04'
    },
    {
      id: 'about',
      label: 'ABOUT',
      component: <About />,
      index: '05'
    },
    {
      id: 'contact',
      label: 'CONTACT',
      component: <Contact />,
      index: '06'
    }
  ];

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();

      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150);

      setScrollDepth(prev => {
        const sensitivity = 0.002;
        const newDepth = prev + (e.deltaY * sensitivity);
        return Math.max(0, Math.min(sections.length - 1, newDepth));
      });
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        setScrollDepth(prev => Math.min(sections.length - 1, prev + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setScrollDepth(prev => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: false });
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(scrollTimeout);
    };
  }, [sections.length]);

  useEffect(() => {
    const currentSectionIndex = Math.floor(scrollDepth);
    setActiveSection(sections[currentSectionIndex]?.id || 'home');
  }, [scrollDepth, sections]);

  const navigateToSection = (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex !== -1) {
      setScrollDepth(sectionIndex);
      setActiveSection(sectionId);
    }
  };

  // Calculate rotation based on scroll depth (full rotation = 360deg across all sections)
  const rotation = (scrollDepth / (sections.length - 1)) * 360;

  // Generate knob markers (like a volume knob)
  const knobMarkers = Array.from({ length: sections.length }, (_, i) => {
    const angle = (i / (sections.length - 1)) * 360;
    return {
      angle,
      isActive: Math.floor(scrollDepth) === i,
      isCurrent: Math.abs(scrollDepth - i) < 0.5
    };
  });

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-black" style={{ perspective: '1200px' }}>

      {/* Header - Outside Portal, Above */}
      <div className="text-center mb-4 md:mb-8 z-50">
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-black text-white tracking-wider">
          PARHAM BEHZAD
        </h1>
      </div>

      {/* Knob Container */}
      <div className="relative">

        {/* Knob Markers - Outside the circle */}
        {knobMarkers.map((marker, i) => {
          const markerAngle = marker.angle - 90; // Start from top
          const radius = isPortrait ? 'calc(45vw + 20px)' : 'calc(min(45vw, 45vh) + 20px)';

          return (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${markerAngle}deg) translateY(-${radius})`,
                transition: 'all 0.2s ease-out'
              }}
            >
              <div
                className={`transition-all duration-200 ${
                  marker.isActive
                    ? 'w-1 h-6 bg-white'
                    : marker.isCurrent
                    ? 'w-0.5 h-4 bg-white opacity-60'
                    : 'w-0.5 h-3 bg-white opacity-30'
                }`}
                style={{
                  transform: marker.isActive ? 'scaleY(1.2)' : 'scaleY(1)'
                }}
              />
            </div>
          );
        })}

        {/* Main Portal - Circle/Knob with rotation */}
        <div
          className="relative z-10 transition-transform"
          style={{
            width: isPortrait ? '90vw' : 'min(90vw, 90vh)',
            height: isPortrait ? '75vh' : 'min(85vw, 85vh)',
            background: '#000000',
            border: '6px solid #FFFFFF',
            borderRadius: '50%',
            boxShadow: `
              0 0 0 2px #000000,
              0 0 40px rgba(255, 255, 255, 0.3),
              ${isScrolling ? '0 0 60px rgba(255, 255, 255, 0.5)' : '0 0 40px rgba(255, 255, 255, 0.3)'}
            `,
            transform: `rotate(${rotation}deg) scale(${isScrolling ? 1.02 : 1})`,
            transitionDuration: isScrolling ? '0.1s' : '0.3s',
            transitionTimingFunction: 'ease-out'
          }}
        >
          {/* Knob Indicator - Small notch at top of circle */}
          <div
            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white"
            style={{
              width: '4px',
              height: '20px',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)'
            }}
          />

          {/* Portal Interior - Counter-rotates to keep content upright */}
          <div
            className="absolute inset-0 overflow-hidden bg-black"
            style={{
              borderRadius: '50%',
              transform: `rotate(-${rotation}deg)`,
              transition: 'transform 0.3s ease-out'
            }}
          >

            {/* 3D Z-Axis Navigation Layers */}
            <div className="absolute inset-0" style={{
              perspective: '2000px',
              transformStyle: 'preserve-3d'
            }}>
              {sections.map((section, index) => {
                const distance = index - scrollDepth;
                const isActive = Math.abs(distance) < 0.15;
                const isVisible = Math.abs(distance) < 3;

                const translateZ = distance * -8000;
                const absDistance = Math.abs(distance);
                const scale = 1 / (1 + absDistance * 0.3);
                const opacity = isVisible ? Math.max(0.1, 1 - absDistance * 0.5) : 0;
                const blur = absDistance * 2;

                if (!isVisible) return null;

                return (
                  <div
                    key={section.id}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      transform: `translateZ(${translateZ}px) scale(${scale})`,
                      opacity: opacity,
                      filter: `blur(${blur}px)`,
                      zIndex: Math.floor(100 - index * 10 + distance * 5),
                      pointerEvents: isActive ? 'auto' : 'none',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="w-full max-w-5xl px-8 md:px-12 pt-8 md:pt-12">
                      {section.component}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Navigation - Bottom Minimal - Counter-rotates */}
          <div
            className="absolute bottom-6 md:bottom-8 left-0 right-0 z-50 flex items-center justify-center gap-3"
            style={{
              transform: `rotate(-${rotation}deg)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            {sections.map((section, index) => {
              const isCurrentSection = Math.floor(scrollDepth) === index;

              return (
                <button
                  key={section.id}
                  className={`w-3 h-3 border-2 transition-all ${
                    isCurrentSection
                      ? 'bg-white border-white'
                      : 'bg-black border-white hover:bg-white'
                  }`}
                  onClick={() => navigateToSection(section.id)}
                  title={section.label}
                />
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Portal;
