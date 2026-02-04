'use client';

import React, { useState, useEffect, useRef } from 'react';
import Home from './sections/Home';
import Compositions from './sections/Compositions';
import Texts from './sections/Texts';
import Tools from './sections/Tools';
import About from './sections/About';
import Contact from './sections/Contact';
import { PortalProvider } from './PortalContext';

interface PortalProps {
  onNavigate?: (section: string) => void;
}

const Portal: React.FC<PortalProps> = ({ onNavigate }) => {
  const [scrollDepth, setScrollDepth] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [isPortrait, setIsPortrait] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track subsection scroll positions (0-1 normalized)
  const subsectionScrolls = useRef<Map<string, number>>(new Map());
  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map());

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

  // Find and cache scrollable elements
  useEffect(() => {
    const findElements = () => {
      sections.forEach(section => {
        const el = document.querySelector(
          `[data-section-id="${section.id}"] [data-scrollable-section="true"]`
        ) as HTMLElement;
        if (el) {
          sectionRefs.current.set(section.id, el);
        }
      });
    };

    // Initial search
    findElements();

    // Retry a few times to catch lazy-loaded elements
    const timer1 = setTimeout(findElements, 100);
    const timer2 = setTimeout(findElements, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [sections]);

  // Apply scroll positions to DOM (render loop)
  useEffect(() => {
    const applyScrollPositions = () => {
      subsectionScrolls.current.forEach((scrollPos, sectionId) => {
        const el = sectionRefs.current.get(sectionId);
        if (el) {
          const maxScroll = el.scrollHeight - el.clientHeight;
          el.scrollTop = scrollPos * maxScroll;
        }
      });
      requestAnimationFrame(applyScrollPositions);
    };

    const rafId = requestAnimationFrame(applyScrollPositions);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Scroll handler - clean and simple
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | undefined;
    let snapTimeout: NodeJS.Timeout | undefined;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      clearTimeout(scrollTimeout);
      clearTimeout(snapTimeout);

      setIsScrolling(true);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150);

      const sectionIndex = Math.round(scrollDepth);
      const distFromCenter = Math.abs(scrollDepth - sectionIndex);
      const atCenter = distFromCenter < 0.05;

      const sectionId = sections[sectionIndex]?.id;
      const hasScrollableContent = sectionRefs.current.has(sectionId);
      const currentScroll = subsectionScrolls.current.get(sectionId) || 0;

      const delta = e.deltaY;
      const ZOOM_SPEED = 0.002;

      // DOWN: Scroll content if at center, else zoom
      if (delta > 0) {
        if (atCenter && hasScrollableContent && currentScroll < 1) {
          // Scroll subsection down
          const newScroll = Math.min(1, currentScroll + delta * 0.001);
          subsectionScrolls.current.set(sectionId, newScroll);
        } else {
          // Zoom forward with magnetic snap
          setScrollDepth(prev => {
            let newDepth = prev + delta * ZOOM_SPEED;

            // Apply magnetic pull when approaching center
            const nextIndex = Math.round(newDepth);
            const distToNext = Math.abs(newDepth - nextIndex);
            const SNAP_ZONE = 0.12;

            if (distToNext < SNAP_ZONE) {
              const snapPull = (SNAP_ZONE - distToNext) / SNAP_ZONE;
              newDepth += (nextIndex - newDepth) * snapPull * 0.3;
            }

            return Math.max(0, Math.min(sections.length - 1, newDepth));
          });
        }
      }
      // UP: Scroll content if at center, else zoom
      else {
        if (atCenter && hasScrollableContent && currentScroll > 0) {
          // Scroll subsection up
          const newScroll = Math.max(0, currentScroll + delta * 0.001);
          subsectionScrolls.current.set(sectionId, newScroll);
        } else {
          // Zoom backward - reset previous section to bottom
          setScrollDepth(prev => {
            let newDepth = prev + delta * ZOOM_SPEED;

            // Apply magnetic pull when approaching center
            const nextIndex = Math.round(newDepth);
            const distToNext = Math.abs(newDepth - nextIndex);
            const SNAP_ZONE = 0.12;

            if (distToNext < SNAP_ZONE) {
              const snapPull = (SNAP_ZONE - distToNext) / SNAP_ZONE;
              newDepth += (nextIndex - newDepth) * snapPull * 0.3;
            }

            newDepth = Math.max(0, Math.min(sections.length - 1, newDepth));
            const newIndex = Math.round(newDepth);

            // Reset previous section to bottom when zooming back
            if (newIndex < sectionIndex) {
              const prevSectionId = sections[newIndex]?.id;
              if (prevSectionId && sectionRefs.current.has(prevSectionId)) {
                subsectionScrolls.current.set(prevSectionId, 1);
              }
            }

            return newDepth;
          });
        }
      }

      // Snap to center when idle
      snapTimeout = setTimeout(() => {
        setScrollDepth(prev => {
          const nearest = Math.round(prev);
          const dist = Math.abs(prev - nearest);
          return dist < 0.15 ? nearest : prev;
        });
      }, 200);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
      clearTimeout(snapTimeout);
    };
  }, [scrollDepth, sections]);

  useEffect(() => {
    const currentSectionIndex = Math.floor(scrollDepth);
    setActiveSection(sections[currentSectionIndex]?.id || 'home');
  }, [scrollDepth, sections]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-black" style={{ perspective: '1200px', cursor: 'none' }}>

      {/* Custom Mouse Cursor */}
      <div
        className="fixed w-3 h-3 rounded-full bg-white pointer-events-none z-[9999]"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
        }}
      />

      {/* Knob Container */}
      <div className="relative">

        {/* Knob Markers - Outside the circle */}
        {knobMarkers.map((marker, i) => {
          const markerAngle = marker.angle - 90; // Start from top
          const radius = isPortrait ? 'calc(48vw + 20px)' : 'calc(min(48vw, 48vh) + 20px)';

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
            width: isPortrait ? '96vw' : 'min(96vw, 96vh)',
            height: isPortrait ? '80vh' : 'min(92vw, 92vh)',
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
                    data-section-id={section.id}
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
                      <PortalProvider isActive={isActive}>
                        {section.component}
                      </PortalProvider>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Single Square Position Indicator - Bottom - Counter-rotates */}
          <div
            className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 z-50"
            style={{
              transform: `translateX(-50%) rotate(-${rotation}deg)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            <div
              className="w-3 h-3 bg-white"
              style={{
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.6)'
              }}
            />
          </div>

        </div>

      </div>
    </div>
  );
};

export default Portal;
