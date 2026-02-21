'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import About from './sections/About';
import Compositions from './sections/Compositions';
import Contact from './sections/Contact';
import Events from './sections/Events';

interface Section {
  id: string;
  title: string;
  path: string;
  component: React.ComponentType | null;
}

const sections: Section[] = [
  { id: 'home', title: '', path: '/', component: null },
  { id: 'compositions', title: 'COMPOSITIONS', path: '/compositions', component: Compositions },
  { id: 'events', title: 'EVENTS', path: '/events', component: Events },
  { id: 'about', title: 'ABOUT', path: '/about', component: About },
  { id: 'contact', title: 'CONTACT', path: '/contact', component: Contact },
];

const pathToIndex: Record<string, number> = {};
sections.forEach((s, i) => { pathToIndex[s.path] = i; });

const Portal: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [scrollDepth, setScrollDepth] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [mouseWarp, setMouseWarp] = useState({ x: 0, y: 0, strength: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [orbPosition, setOrbPosition] = useState<{ x: number; y: number } | null>(null);
  const [isOrbExpanded, setIsOrbExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const orbRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  const isOrbInCorner = activeSection !== null && activeSection !== 0;
  const showOrbLarge = !isOrbInCorner || isOrbExpanded;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Lock body scroll while portal is mounted
  useEffect(() => {
    document.body.classList.add('portal-lock');
    return () => {
      document.body.classList.remove('portal-lock');
    };
  }, []);

  // Initialize from URL on mount
  useEffect(() => {
    const path = window.location.pathname;
    const idx = pathToIndex[path];
    if (idx !== undefined && idx > 0) {
      setActiveSection(idx);
      setScrollDepth(idx);
      setHasInteracted(true);
    }
  }, []);

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const idx = pathToIndex[path];
      if (idx !== undefined && idx > 0) {
        setActiveSection(idx);
        setScrollDepth(idx);
        setHasInteracted(true);
      } else {
        setActiveSection(null);
        setScrollDepth(0);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Reset orbPosition when orb returns to center
  useEffect(() => {
    if (!isOrbInCorner) {
      setOrbPosition(null);
    }
  }, [isOrbInCorner]);

  // Drag handling for the corner orb
  useEffect(() => {
    const orbEl = orbRef.current;
    if (!orbEl) return;

    let dragStartPos = { x: 0, y: 0 };
    let hasMoved = false;

    const startDrag = (clientX: number, clientY: number) => {
      const rect = orbEl.getBoundingClientRect();
      dragOffset.current = {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
      dragStartPos = { x: clientX, y: clientY };
      hasMoved = false;
    };

    const moveDrag = (clientX: number, clientY: number) => {
      const dx = clientX - dragStartPos.x;
      const dy = clientY - dragStartPos.y;
      if (!hasMoved && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
      hasMoved = true;
      setIsDragging(true);
      setOrbPosition({
        x: clientX - dragOffset.current.x,
        y: clientY - dragOffset.current.y,
      });
    };

    const endDrag = () => {
      didDrag.current = hasMoved;
      setIsDragging(false);
    };

    // Mouse drag
    const handleMouseDown = (e: MouseEvent) => {
      if (!isOrbInCorner || isOrbExpanded) return;
      startDrag(e.clientX, e.clientY);
      const onMouseMove = (ev: MouseEvent) => {
        ev.preventDefault();
        moveDrag(ev.clientX, ev.clientY);
      };
      const onMouseUp = () => {
        endDrag();
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    // Touch drag
    const handleTouchStartDrag = (e: TouchEvent) => {
      if (!isOrbInCorner || isOrbExpanded) return;
      const touch = e.touches[0];
      startDrag(touch.clientX, touch.clientY);
    };

    const handleTouchMoveDrag = (e: TouchEvent) => {
      if (!isOrbInCorner || isOrbExpanded) return;
      const touch = e.touches[0];
      moveDrag(touch.clientX, touch.clientY);
      if (hasMoved) e.preventDefault();
    };

    const handleTouchEndDrag = () => {
      if (!isOrbInCorner || isOrbExpanded) return;
      endDrag();
    };

    orbEl.addEventListener('mousedown', handleMouseDown);
    orbEl.addEventListener('touchstart', handleTouchStartDrag, { passive: true });
    orbEl.addEventListener('touchmove', handleTouchMoveDrag, { passive: false });
    orbEl.addEventListener('touchend', handleTouchEndDrag);
    return () => {
      orbEl.removeEventListener('mousedown', handleMouseDown);
      orbEl.removeEventListener('touchstart', handleTouchStartDrag);
      orbEl.removeEventListener('touchmove', handleTouchMoveDrag);
      orbEl.removeEventListener('touchend', handleTouchEndDrag);
    };
  }, [isOrbInCorner]);

  // Handle wheel + touch events on the orb (section scrolling)
  useEffect(() => {
    const orbEl = orbRef.current;
    if (!orbEl) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setHasInteracted(true);

      clearTimeout(scrollTimeout);
      setIsScrolling(true);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150);

      const delta = e.deltaY;
      const SCROLL_SPEED = 0.003;

      setScrollVelocity(delta * 0.5);

      setScrollDepth(prev => {
        const newDepth = Math.max(0, Math.min(sections.length - 1, prev + delta * SCROLL_SPEED));
        return newDepth;
      });
    };

    orbEl.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      orbEl.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // When orb is large (centered or expanded), listen for global wheel/touch
  useEffect(() => {
    if (isOrbInCorner && !isOrbExpanded) return;

    let scrollTimeout: NodeJS.Timeout;
    let lastTouchY = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setHasInteracted(true);

      clearTimeout(scrollTimeout);
      setIsScrolling(true);
      scrollTimeout = setTimeout(() => setIsScrolling(false), 150);

      const delta = e.deltaY;
      const SCROLL_SPEED = 0.002;

      setScrollVelocity(delta * 0.5);

      setScrollDepth(prev => {
        const newDepth = Math.max(0, Math.min(sections.length - 1, prev + delta * SCROLL_SPEED));
        return newDepth;
      });
    };

    const handleTouchStart = (e: TouchEvent) => {
      lastTouchY = e.touches[0].clientY;
      setIsScrolling(true);
      setHasInteracted(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const currentY = e.touches[0].clientY;
      const delta = lastTouchY - currentY;
      lastTouchY = currentY;

      const TOUCH_SPEED = 0.006;
      setScrollVelocity(delta * 2);

      setScrollDepth(prev => {
        const newDepth = Math.max(0, Math.min(sections.length - 1, prev + delta * TOUCH_SPEED));
        return newDepth;
      });
    };

    const handleTouchEnd = () => {
      setIsScrolling(false);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOrbInCorner, isOrbExpanded]);

  // Velocity decay
  useEffect(() => {
    const VELOCITY_DECAY = 0.85;
    let rafId: number;

    const decay = () => {
      setScrollVelocity(prev => {
        const newVelocity = prev * VELOCITY_DECAY;
        if (Math.abs(newVelocity) < 0.1) return 0;
        rafId = requestAnimationFrame(decay);
        return newVelocity;
      });
    };

    if (Math.abs(scrollVelocity) > 0.1) {
      rafId = requestAnimationFrame(decay);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [scrollVelocity]);

  // ESC to close expanded orb or return home
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isOrbExpanded) {
          setIsOrbExpanded(false);
        } else if (isOrbInCorner) {
          handleGoHome();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOrbInCorner, isOrbExpanded]);

  // Mouse magnetic warp effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const orbEl = orbRef.current;
      if (!orbEl) return;

      const rect = orbEl.getBoundingClientRect();
      const orbCenterX = rect.left + rect.width / 2;
      const orbCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - orbCenterX;
      const dy = e.clientY - orbCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const orbRadius = rect.width / 2;

      // Inside the orb → no warp (perfect circle)
      if (distance < orbRadius) {
        setMouseWarp({ x: 0, y: 0, strength: 0 });
        return;
      }

      const maxRange = orbRadius * 4;
      const strength = Math.max(0, 1 - (distance - orbRadius) / (maxRange - orbRadius));

      // Normalized direction (-1 to 1)
      const nx = dx / distance;
      const ny = dy / distance;

      setMouseWarp({ x: nx * strength, y: ny * strength, strength });
    };

    const handleTouchEnd = () => {
      setMouseWarp({ x: 0, y: 0, strength: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleSectionClick = useCallback((index: number) => {
    // When orb is small in corner, don't navigate — the orb click handler will expand it
    if (isOrbInCorner && !isOrbExpanded) return;
    setHasInteracted(true);
    if (index === 0) {
      handleGoHome();
      return;
    }
    setActiveSection(index);
    setScrollDepth(index);
    setIsOrbExpanded(false);
    window.history.pushState({}, '', sections[index].path);
  }, [isOrbInCorner, isOrbExpanded]);

  // Desktop: single click navigates to nearest section, double click expands.
  // Mobile: single tap expands.
  const handleOrbClick = useCallback(() => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    if (!isOrbInCorner || isOrbExpanded) return;
    setHasInteracted(true);
    if (isMobile) {
      setIsOrbExpanded(true);
    } else {
      // Desktop: navigate to the nearest section
      const nearestIndex = Math.round(scrollDepth);
      if (nearestIndex === 0) {
        handleGoHome();
      } else {
        setActiveSection(nearestIndex);
        setScrollDepth(nearestIndex);
        window.history.pushState({}, '', sections[nearestIndex].path);
      }
    }
  }, [isOrbInCorner, isOrbExpanded, isMobile, scrollDepth]);

  const handleOrbDoubleClick = useCallback(() => {
    if (isOrbInCorner && !isOrbExpanded) {
      setHasInteracted(true);
      setIsOrbExpanded(true);
    }
  }, [isOrbInCorner, isOrbExpanded]);

  const handleGoHome = useCallback(() => {
    setActiveSection(null);
    setScrollDepth(0);
    window.history.pushState({}, '', '/');
  }, []);

  const rotation = (scrollDepth / (sections.length - 1)) * 360;

  const TILT_SENSITIVITY = 0.1;
  const TILT_MAX = 15;
  const tiltAngle = Math.max(-TILT_MAX, Math.min(TILT_MAX, scrollVelocity * TILT_SENSITIVITY));

  // Compute warped border-radius: bulge the contour toward the mouse
  const WARP_AMOUNT = 8; // max % deviation from 50%
  const w = mouseWarp;
  // Each corner: top-left, top-right, bottom-right, bottom-left
  // Positive x = mouse is right, positive y = mouse is below
  const brTL = 50 - ((-w.x + -w.y) * 0.5 * WARP_AMOUNT);
  const brTR = 50 - (( w.x + -w.y) * 0.5 * WARP_AMOUNT);
  const brBR = 50 - (( w.x +  w.y) * 0.5 * WARP_AMOUNT);
  const brBL = 50 - ((-w.x +  w.y) * 0.5 * WARP_AMOUNT);
  const warpedBorderRadius = `${brTL}% ${brTR}% ${brBR}% ${brBL}%`;
  const nearestSectionIndex = Math.round(scrollDepth);

  const ActiveComponent = activeSection !== null && activeSection > 0
    ? sections[activeSection].component
    : null;

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">

      {/* Name — fixed top-right */}
      <div className="fixed top-6 right-6 md:top-12 md:right-12 z-50">
        <span
          className="text-sm font-normal tracking-wide cursor-pointer hover:opacity-70 transition-opacity"
          onClick={handleGoHome}
        >
          parham behzad
        </span>
      </div>

      {/* Backdrop when orb is expanded */}
      {isOrbExpanded && (
        <div
          className="fixed inset-0 bg-black/70 z-[45] transition-opacity duration-300"
          onClick={() => setIsOrbExpanded(false)}
        />
      )}

      {/* Orb — centered, corner, or expanded overlay */}
      <div
        ref={orbRef}
        onClick={handleOrbClick}
        onDoubleClick={handleOrbDoubleClick}
        className="absolute z-40"
        style={{
          width: showOrbLarge ? 'min(55vw, 55vh)' : (isMobile ? '70px' : '120px'),
          height: showOrbLarge ? 'min(55vw, 55vh)' : (isMobile ? '70px' : '120px'),
          ...(showOrbLarge
            ? {
                left: '50%',
                top: '50%',
                bottom: 'auto',
                transform: 'translate(-50%, -50%)',
              }
            : orbPosition
              ? {
                  left: `${orbPosition.x}px`,
                  top: `${orbPosition.y}px`,
                  bottom: 'auto',
                  transform: 'none',
                }
              : {
                  left: isMobile ? '16px' : '40px',
                  top: 'auto',
                  bottom: isMobile ? '16px' : '40px',
                  transform: 'none',
                }),
          transition: isDragging ? 'width 0.6s, height 0.6s' : 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          perspective: '2000px',
          zIndex: isOrbExpanded ? 50 : undefined,
        }}
      >
        <div
          className="w-full h-full relative border border-white bg-black overflow-hidden cursor-pointer"
          style={{
            borderRadius: warpedBorderRadius,
            transform: `rotate(${rotation}deg) scale(${isScrolling ? 1.02 : 1}) rotateY(${tiltAngle}deg)`,
            transition: isScrolling ? 'transform 0.1s ease-out, border-radius 0.15s ease-out' : 'transform 0.3s ease-out, border-radius 0.15s ease-out',
          }}
        >
          {/* Counter-rotate interior */}
          <div
            className="absolute inset-0"
            style={{
              transform: `rotate(-${rotation}deg)`,
              transition: isScrolling ? 'transform 0.1s linear' : 'transform 0.3s ease-out',
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="absolute inset-0" style={{
              perspective: '2000px',
              transformStyle: 'preserve-3d'
            }}>
              {sections.map((section, index) => {
                const distance = index - scrollDepth;
                const isVisible = Math.abs(distance) < 5;
                const isClickable = index === nearestSectionIndex;

                if (!isVisible) return null;

                const translateZ = distance * (showOrbLarge ? -8000 : -2000);
                const absDistance = Math.abs(distance);
                const scale = 1 / (1 + absDistance * 0.3);
                const opacity = Math.max(0.1, 1 - absDistance * 0.5);
                const blur = absDistance * 2;
                return (
                  <div
                    key={section.id}
                    className={`absolute inset-0 flex items-center justify-center ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                    style={{
                      transform: `translateZ(${translateZ}px) scale(${scale})`,
                      opacity,
                      filter: `blur(${blur}px)`,
                      zIndex: Math.floor(1000 - absDistance * 100),
                      pointerEvents: isClickable ? 'auto' : 'none',
                      transformStyle: 'preserve-3d',
                      transition: isScrolling ? 'none' : 'all 0.3s ease-out',
                    }}
                    onClick={() => handleSectionClick(index)}
                  >
                    <div className="text-center">
                      {section.id === 'home' && (
                        <div
                          className="rounded-full overflow-hidden border border-white/30"
                          style={{
                            width: '75%',
                            height: '75%',
                            margin: '0 auto',
                            opacity: Math.max(0, 1 - absDistance * 1.2),
                            filter: `blur(${absDistance * 6}px)`,
                            transition: isScrolling ? 'none' : 'all 0.3s ease-out',
                          }}
                        >
                          <img src="/ParhamBehzad.jpg" alt="Parham Behzad" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {section.title && (
                        <h2
                          className={`font-black uppercase tracking-wider ${
                            showOrbLarge
                              ? 'text-4xl md:text-6xl'
                              : 'text-[10px]'
                          }`}
                        >
                          {section.title}
                        </h2>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Position indicator */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white"
            style={{
              width: showOrbLarge ? '3px' : '2px',
              height: showOrbLarge ? '20px' : '10px',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
            }}
          />
        </div>
      </div>

      {/* First-visit guidance */}
      {!hasInteracted && (
        <div className="fixed left-1/2 bottom-8 -translate-x-1/2 z-50 pointer-events-none text-center">
          <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-60">
            {showOrbLarge
              ? (isMobile
                ? 'Swipe to explore. Tap a title to open.'
                : 'Scroll to explore. Click a title to open.')
              : (isMobile
                ? 'Tap orb to open section list.'
                : 'Click orb to jump. Double-click to expand.')}
          </div>
        </div>
      )}

      {/* Content area — center, slightly right */}
      <div
        className={`absolute inset-0 flex items-start justify-center overflow-y-auto transition-all duration-500 ${
          ActiveComponent && !isOrbExpanded ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ zIndex: 30 }}
      >
        <div
          className="w-full max-w-4xl px-4 md:px-12 py-16 md:py-24 md:ml-[5%]"
        >
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>
    </div>
  );
};

export default Portal;
