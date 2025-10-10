import React, { useState, useEffect } from 'react';

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<boolean[]>([]);
  
  // Sample portfolio works - replace with actual data
  const portfolioWorks = [
    {
      title: "Quantum Harmonics",
      image: "/path-to-image-1.jpg" // Replace with actual image path
    },
    {
      title: "Digital Emergence", 
      image: "/path-to-image-2.jpg" // Replace with actual image path
    },
    {
      title: "Temporal Fragments",
      image: "/path-to-image-3.jpg" // Replace with actual image path
    },
    {
      title: "Neural Networks",
      image: "/path-to-image-4.jpg" // Replace with actual image path
    }
  ];

  useEffect(() => {
    // Initialize image error state
    setImageErrors(new Array(portfolioWorks.length).fill(false));
  }, [portfolioWorks.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portfolioWorks.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [portfolioWorks.length]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = true;
      return newErrors;
    });
  };

  return (
    <div className="space-y-8 md:space-y-16 text-center w-full">
      {/* Hero Section */}
      <div className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
        <div className="space-y-4 md:space-y-6">
          <h2 className="text-lg sm:text-2xl md:text-4xl font-light opacity-95 tracking-wide">
            Composer & Developer
          </h2>
          <p className="text-base sm:text-lg md:text-2xl opacity-85 font-light leading-relaxed">
            Exploring the intersections of music, philosophy, and technology
          </p>
          <p className="text-sm sm:text-base md:text-lg opacity-75 font-light max-w-3xl mx-auto leading-relaxed">
            This site serves as a central hub for my compositions, research, and digital experiments.
            Navigate through the portal to discover different dimensions of my work.
          </p>
        </div>
      </div>

      {/* Portfolio Slideshow */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-base sm:text-lg md:text-xl font-light opacity-80 mb-6 md:mb-8 tracking-wide">Recent Works</h3>
        
        <div className="relative bg-black rounded-2xl border border-white/20 overflow-hidden">
          {/* Large Image */}
          <div className="aspect-video bg-gray-800 flex items-center justify-center">
            {imageErrors[currentSlide] ? (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white/40 text-lg">
                Image placeholder
              </div>
            ) : (
              <img 
                src={portfolioWorks[currentSlide].image}
                alt={portfolioWorks[currentSlide].title}
                className="w-full h-full object-cover"
                onError={() => handleImageError(currentSlide)}
              />
            )}
          </div>
          
          {/* Title */}
          <div className="p-4 md:p-6 text-center">
            <h4 className="text-base sm:text-lg md:text-xl font-medium opacity-95">
              {portfolioWorks[currentSlide].title}
            </h4>
          </div>
          
        </div>
        
        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2 mt-6">
          {portfolioWorks.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white opacity-80' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        
        <p className="text-xs sm:text-sm opacity-60 mt-4 md:mt-6 font-light">
          Scroll through the portal to explore more detailed sections
        </p>
      </div>
    </div>
  );
};

export default Home;