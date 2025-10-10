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
  const [isClient, setIsClient] = useState(false);
  
  // Generate random cosmos parameters once on load
  const [cosmosConfig] = useState(() => {
    // 1. Number of particles (range: 600-1000)
    const starCount = 600 + Math.floor(Math.random() * 400);
    const glowOrbCount = 20 + Math.floor(Math.random() * 30);
    const speedLineCount = 30 + Math.floor(Math.random() * 40);
    const tunnelLineCount = 15 + Math.floor(Math.random() * 20);
    
    // Generate individual particles with random properties
    const stars = Array.from({ length: starCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      // 2. Size range: 0.8px to 6px
      size: 0.8 + Math.random() * 5.2,
      // 3. Subtle colors with occasional warm contrasts
      color: [
        '#d7d7d7', '#d7d7d7', '#d7d7d7', '#d7d7d7', '#d7d7d7', // mostly white (dominant)
        '#e0e0e0', '#d0d0d0', '#c8c8c8', '#dadada', // subtle grays
        '#ddeeff', '#e6f2ff', '#f0f8ff', '#e8f4f8', // barely tinted blues
        '#e0f0f0', '#e8f8f8', '#f0fafa', '#e4f4f4', // barely tinted cyans
        '#ff6b6b', '#ff8a80', '#ffab91', '#ff7043', // warm reds/oranges (occasional)
        '#ffd54f', '#ffb74d', '#ff9800'  // warm yellows/oranges (occasional)
      ][Math.floor(Math.random() * 22)],
      opacity: 0.15 + Math.random() * 0.35, // Lower opacity for subtlety
      // 4. Glow size range: 2x to 8x particle size
      glowSize: 2 + Math.random() * 6,
      blur: Math.random() > 0.4 ? Math.random() * 1.8 : 0
    }));
    
    const glowOrbs = Array.from({ length: glowOrbCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      // Size range: 6px to 20px
      size: 6 + Math.random() * 14,
      // 5. Glow colors with occasional warm contrasts
      color: [
        '#e8f0f8', '#e8f4f8', '#f0f4f8', '#f0f8f8', '#e4f0f0', // barely blue
        '#f0f8ff', '#e8f4ff', '#f4f8ff', '#e0f0f0', '#f0f8f0', // barely cyan
        '#f8f8f8', '#f4f4f4', '#e8e8e8', '#ececec', '#f0f0f0', // near whites
        '#ff6b6b', '#ff8a80', '#ffab91', '#ff7043', // warm contrast glows
        '#ffd54f', '#ffb74d'  // warm yellow/orange glows
      ][Math.floor(Math.random() * 21)],
      intensity: 15 + Math.random() * 25,
      opacity: 0.1 + Math.random() * 0.25, // Much more subtle glow
      blur: 1.5 + Math.random() * 3.5
    }));
    
    const speedLines = Array.from({ length: speedLineCount }, (_, i) => ({
      id: i,
      angle: Math.random() * 2 * Math.PI,
      radius: 25 + Math.random() * 30,
      length: 12 + Math.random() * 35,
      thickness: 0.6 + Math.random() * 1.8,
      baseOpacity: 0.12 + Math.random() * 0.35,
      stretchFactor: 2.5 + Math.random() * 2.5
    }));
    
    const tunnelLines = Array.from({ length: tunnelLineCount }, (_, i) => ({
      id: i,
      angle: Math.random() * 360,
      radius: 30 + Math.random() * 20,
      height: 18 + Math.random() * 30,
      width: 0.6 + Math.random() * 1.2,
      opacity: 0.06 + Math.random() * 0.18,
      growthRate: 0.09 + Math.random() * 0.05
    }));
    
    return { stars, glowOrbs, speedLines, tunnelLines };
  });

  const sections = [
    { 
      id: 'home', 
      label: 'HOME', 
      component: <Home />,
      subItems: ['Hero', 'Portfolio Showcase', 'Recent Works']
    },
    { 
      id: 'compositions', 
      label: 'COMPOSITIONS', 
      component: <Compositions />,
      subItems: ['Recent Works', 'Ensemble', 'Solo', 'Electronics']
    },
    { 
      id: 'texts', 
      label: 'TEXTS', 
      component: <Texts />,
      subItems: ['Essays', 'Research', 'Theory']
    },
    { 
      id: 'tools', 
      label: 'TOOLS', 
      component: <Tools />,
      subItems: ['Web Apps', 'Max/MSP', 'JavaScript']
    },
    { 
      id: 'about', 
      label: 'ABOUT', 
      component: <About />,
      subItems: ['Biography', 'Education', 'Experience']
    },
    { 
      id: 'contact', 
      label: 'CONTACT', 
      component: <Contact />,
      subItems: ['Email', 'Social', 'Availability']
    }
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      setScrollDepth(prev => {
        const sensitivity = 0.001; // Extremely slow for very long travel feeling
        const newDepth = prev + (e.deltaY * sensitivity);
        return Math.max(0, Math.min(sections.length - 1, newDepth));
      });
    };

    // Add keyboard navigation for better control
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

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ perspective: '1000px' }}>
      {/* Enhanced Space Background - Behind Everything */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Pre-generated Star Field */}
          {cosmosConfig.stars.map((star) => {
            const isColored = star.color !== '#d7d7d7' && (star.color.startsWith('#ff') || star.color.startsWith('#dd') || star.color.startsWith('#e0f') || star.color.startsWith('#f0f'));
            
            return (
              <div
                key={`star-${star.id}`}
                className="absolute rounded-full"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  backgroundColor: star.color,
                  opacity: star.opacity,
                  boxShadow: isColored 
                    ? `0 0 ${star.size * star.glowSize}px ${star.color}40, 0 0 ${star.size * star.glowSize * 2}px ${star.color}20` 
                    : `0 0 ${star.size}px rgba(255,255,255,0.3)`,
                  filter: star.blur > 0 ? `blur(${star.blur}px)` : 'none'
                }}
              />
            );
          })}

          {/* Pre-generated Glow Orbs */}
          {cosmosConfig.glowOrbs.map((orb) => (
            <div
              key={`glow-${orb.id}`}
              className="absolute rounded-full"
              style={{
                left: `${orb.left}%`,
                top: `${orb.top}%`,
                width: `${orb.size}px`,
                height: `${orb.size}px`,
                background: `radial-gradient(circle, ${orb.color}${orb.intensity} 0%, ${orb.color}${Math.floor(orb.intensity/3)} 50%, transparent 100%)`,
                opacity: orb.opacity,
                filter: `blur(${orb.blur}px)`
              }}
            />
          ))}
          
        </div>
      )}

      {/* Main Portal Circle - 90% Size */}
      <div 
        className="relative rounded-full z-10"
        style={{
          width: 'min(90vw, 90vh)',
          height: 'min(90vw, 90vh)',
          background: '#000000',
          aspectRatio: '1',
          boxShadow: `
            0 0 20px rgba(255, 255, 255, 0.8),
            0 0 40px rgba(255, 255, 255, 0.6),
            0 0 80px rgba(255, 255, 255, 0.4),
            0 0 160px rgba(255, 255, 255, 0.3)
          `
        }}
      >
        {/* Portal Interior */}
        <div className="absolute inset-0 rounded-full overflow-hidden bg-black" style={{
          animation: 'portalWarp 8s ease-in-out infinite'
        }}>

          {/* Scroll-Responsive Forward Motion Effects */}
          {isClient && (
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
              {/* Pre-generated Speed Lines that respond to scroll */}
              {cosmosConfig.speedLines.map((line) => {
                const x = 50 + Math.cos(line.angle) * line.radius;
                const y = 50 + Math.sin(line.angle) * line.radius;
                
                return (
                  <div
                    key={`speed-line-${line.id}`}
                    className="absolute bg-gradient-to-r from-transparent via-white to-transparent"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${line.length}px`,
                      height: `${line.thickness}px`,
                      transform: `rotate(${(line.angle * 180) / Math.PI}deg) scaleX(${1 + Math.abs(scrollDepth - Math.floor(scrollDepth)) * line.stretchFactor})`,
                      transformOrigin: '0% 50%',
                      opacity: line.baseOpacity * Math.abs(scrollDepth - Math.floor(scrollDepth)) + 0.05
                    }}
                  />
                );
              })}

              {/* Pre-generated Tunnel Effect Lines */}
              {cosmosConfig.tunnelLines.map((tunnel) => {
                const x = 50 + Math.cos(tunnel.angle * Math.PI / 180) * tunnel.radius;
                const y = 50 + Math.sin(tunnel.angle * Math.PI / 180) * tunnel.radius;
                
                return (
                  <div
                    key={`tunnel-${tunnel.id}`}
                    className="absolute bg-white"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      width: `${tunnel.width}px`,
                      height: `${tunnel.height}px`,
                      transform: `rotate(${tunnel.angle}deg) scaleY(${1 + scrollDepth * tunnel.growthRate})`,
                      transformOrigin: '50% 0%',
                      opacity: tunnel.opacity
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Header - Always Visible */}
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center z-50" style={{
            animation: 'float 6s ease-in-out infinite'
          }}>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2 tracking-wider" style={{
              animation: 'textShimmer 3s ease-in-out infinite'
            }}>PARHAM BEHZAD</h1>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-widest opacity-80">○●</h2>
          </div>


          {/* 3D Z-Axis Navigation Layers */}
          <div className="absolute inset-0" style={{
            perspective: '2000px',
            transformStyle: 'preserve-3d'
          }}>
            {sections.map((section, index) => {
              // Calculate distance from current scroll position
              const distance = index - scrollDepth;
              
              // Determine visibility and interaction - wider range to see effects
              const isActive = Math.abs(distance) < 0.15; // Smaller active zone
              const isVisible = Math.abs(distance) < 4; // Wider visibility
              
              // 3D positioning calculations - completely smooth
              const translateZ = distance * -10000;
              
              // Continuous scaling - ALWAYS based on absolute distance, no special cases
              const absDistance = Math.abs(distance);
              const scale = 1 / (1 + absDistance * 0.2); // Even more dramatic scaling
              
              // Continuous fade - ALWAYS based on distance, no active/inactive differences
              const opacity = isVisible ? 1 / (1 + absDistance * 0.4) : 0;
              
              // Continuous blur - ALWAYS blurs based on distance from exact center
              const blur = absDistance * absDistance * 12;
              
              // Continuous brightness
              const brightness = 1 / (1 + absDistance * 0.3);
              
              // Very gentle approaching rotation for both directions
              const rotateX = Math.abs(distance) > 0.1 ? Math.min(5, Math.abs(distance) * 2) : 0;
              
              if (!isVisible) return null;
              
              return (
                <div
                  key={section.id}
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    transform: `
                      translateZ(${translateZ}px) 
                      scale(${scale}) 
                      rotateX(${rotateX}deg)
                    `,
                    opacity: opacity,
                    filter: `blur(${blur}px) brightness(${brightness})`,
                    zIndex: Math.floor(100 - index * 10 + distance * 5),
                    pointerEvents: isActive ? 'auto' : 'none',
                    animation: 'none', // Remove any special animation that might interfere
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div 
                    className="text-white w-full max-w-6xl px-16 pt-24"
                    style={{
                      transform: `rotateX(${-rotateX * 0.5}deg)`, // Counter-rotate content slightly
                    }}
                  >
                    {section.component}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Circular Navigation Bar - Exactly on Portal Border */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none z-20"
          style={{
            animation: 'portalWarp 8s ease-in-out infinite', // Same animation as portal
            border: `${2 + (scrollDepth / (sections.length - 1)) * 4}px solid rgba(255, 255, 255, 0.6)`, // Gets thicker on scroll
            boxShadow: `0 0 ${10 + (scrollDepth / (sections.length - 1)) * 20}px rgba(255, 255, 255, 0.3)`
          }}
        />

        {/* Navigation Items on the Circle */}
        {isClient && (
          <div 
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              animation: 'portalWarp 8s ease-in-out infinite' // Same animation as portal
            }}
          >
            {sections.map((section, index) => {
              const angle = (index / sections.length) * 2 * Math.PI - Math.PI / 2;
              const radius = 50; // Exactly on the portal border
              const x = 50 + Math.cos(angle) * radius;
              const y = 50 + Math.sin(angle) * radius;
              
              const isCurrentSection = Math.floor(scrollDepth) === index;
              
              return (
                <div
                  key={section.id}
                  className="absolute pointer-events-auto cursor-pointer group"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => navigateToSection(section.id)}
                >
                  <div 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      isCurrentSection 
                        ? 'bg-white scale-150 shadow-[0_0_15px_rgba(255,255,255,0.8)]' 
                        : 'bg-white/50 hover:bg-white hover:scale-125'
                    }`}
                  />
                  <div 
                    className={`absolute text-xs font-light mt-2 text-center transition-all duration-300 ${
                      isCurrentSection ? 'text-white opacity-100' : 'text-white/60 opacity-80'
                    }`}
                    style={{
                      transform: 'translateX(-50%)',
                      left: '50%'
                    }}
                  >
                    {section.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      
    </div>
  );
};

export default Portal;