import React, { useState, useEffect } from 'react';
import './App.css';
import ImageDisplay from './section/Image_display';
import AngleSlider from './section/AngleSlider';
import data from './section/s_duct_shapes.json';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [angle, setAngle] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  
  // Handle angle changes with a transition effect
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 800); // Match this with the animation duration in AngleSlider
    
    return () => clearTimeout(timer);
  }, [angle]);

  const handleDownload = () => {
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = '/path-to-your-file.pdf'; // Replace with your actual file path
    link.download = 's_duct_documentation.pdf'; // Replace with your desired filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            S-Duct Simulation Visualizer
          </h1>
          <p className="text-gray-600">
            Explore performance characteristics at different bend angles
          </p>
          
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              About
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Attachments
            </button>
          </div>
          
          <AnimatePresence>
            {showAbout && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4 mx-auto max-w-2xl"
              >
                <div className="bg-white p-4 rounded-lg shadow text-left">
                  <p className="text-gray-700">
                    Its such a beautiful day of practicum. Its important to analyse s duct. Take this time
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
        
        <AngleSlider angle={angle} setAngle={setAngle} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={`angle-display-${angle}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: 0.2 // Slight delay after slider animation starts
            }}
            className="mt-8 relative"
          >
            {isTransitioning && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <p className="mt-4 text-gray-700 font-medium">Updating visualization...</p>
                </div>
              </motion.div>
            )}
            
            <ImageDisplay angle={angle} data={data} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;