// LoadingScreen.jsx
import { useEffect, useState } from "react";

export const LoadingScreen = ({ loadingSlide }) => {
  // Animation states for pirate-themed loading
  const [wavePosition, setWavePosition] = useState(0);
  const [shipPosition, setShipPosition] = useState(-20);
  const [islandVisible, setIslandVisible] = useState(false);
  const [loadingText, setLoadingText] = useState("Sailing the high seas");
  
  // Animation effect for pirate loading screen
  useEffect(() => {
    if (loadingSlide) {
      // Wave animation
      const waveInterval = setInterval(() => {
        setWavePosition(prev => (prev + 1) % 20);
      }, 120);
      
      // Ship animation - gradually move across screen
      const shipInterval = setInterval(() => {
        setShipPosition(prev => {
          if (prev >= 85) {
            // When ship reaches end, show island
            setIslandVisible(true);
            setLoadingText("Land ho! Island spotted!");
            return prev;
          }
          return prev + 2;
        });
      }, 100);
      
      // Loading text animation
      const textInterval = setInterval(() => {
        if (!islandVisible) {
          setLoadingText(prev => {
            if (prev.endsWith("...")) return "Sailing the high seas";
            return prev + ".";
          });
        }
      }, 500);
      
      return () => {
        clearInterval(waveInterval);
        clearInterval(shipInterval);
        clearInterval(textInterval);
      };
    }
  }, [loadingSlide, islandVisible]);

  return (
    <div
      className={`fixed z-30 top-0 left-0 right-0 h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-1000
      ${loadingSlide ? "opacity-100" : "opacity-0 pointer-events-none"}
      `}
    >
      {/* Sky and clouds */}
      <div className="absolute top-0 left-0 w-full h-1/3 overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white bg-opacity-80"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 40 + 20}px`,
              left: `${(i * 20) + (Math.random() * 10)}%`,
              top: `${Math.random() * 100}px`,
            }}
          />
        ))}
      </div>

      {/* Island (appears later) */}
      <div
        className={`absolute transition-opacity duration-1000 ${islandVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{ right: '15%', bottom: '20%' }}
      >
        <div className="w-48 h-32 bg-yellow-700 rounded-t-full relative">
          <div className="absolute top-0 left-1/4 w-8 h-16 bg-green-800 rounded-full"></div>
          <div className="absolute top-0 left-1/2 w-10 h-20 bg-green-700 rounded-full"></div>
          <div className="absolute top-0 right-1/4 w-8 h-16 bg-green-800 rounded-full"></div>
        </div>
      </div>

      {/* Ship */}
      <div
        className="absolute transition-transform duration-300 ease-in-out"
        style={{ 
          bottom: '30%', 
          left: `${shipPosition}%`,
          transform: `rotate(${Math.sin(Date.now() / 1000) * 5}deg)`,
        }}
      >
        <div className="relative">
          {/* Ship hull */}
          <div className="w-24 h-12 bg-amber-800 rounded-b-full"></div>
          
          {/* Ship mast */}
          <div className="absolute bottom-8 left-1/2 w-2 h-20 bg-amber-900 -translate-x-1/2"></div>
          
          {/* Ship sail */}
          <div className="absolute bottom-12 left-1/2 w-16 h-14 bg-white -translate-x-1/2 -translate-x-1"
              style={{ clipPath: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)' }}>
            <div className="w-full h-0.5 bg-amber-700 mt-2"></div>
            <div className="w-full h-0.5 bg-amber-700 mt-2"></div>
            <div className="w-6 h-6 absolute top-1 left-1/2 -translate-x-1/2 text-black text-xl">☠️</div>
          </div>
        </div>
      </div>

      {/* Ocean waves */}
      <div className="absolute bottom-0 left-0 w-full h-1/4 bg-blue-700">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div
            key={i}
            className="absolute bg-blue-500 rounded-full"
            style={{
              width: '120px',
              height: '40px',
              left: `${((i * 10) + wavePosition) % 100}%`,
              bottom: `${Math.random() * 20 + 60}%`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Loading text */}
      <div className="absolute bottom-10 font-bold text-3xl text-white font-serif drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
        {loadingText}
      </div>
    </div>
  );
};