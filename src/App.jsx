// App.js with updated Navigation Bar
import React, { useState, useEffect } from 'react';
import './App.css';
import ImageDisplay from './section/Image_display';
import AngleSlider from './section/AngleSlider';
import data from './section/s_duct_shapes.json';
import { motion, AnimatePresence } from 'framer-motion';
import AIModel from './AIModel';
import NavBar from './NavBar'; // Import the NavBar component

function App() {
  const [angle, setAngle] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAIModel, setShowAIModel] = useState(false);

  // Handle angle changes with a transition effect
  useEffect(() => {
    if (!showAIModel) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 800); // Match this with the animation duration in AngleSlider

      return () => clearTimeout(timer);
    }
  }, [angle, showAIModel]);

  const handleRedirectToWiki = () => {
    // Redirect to Wikipedia page instead of downloading
    window.open("https://en.wikipedia.org/wiki/S-duct", "_blank");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Include the NavBar component and pass the state setters */}
      {!showAIModel && <NavBar 
        showAbout={showAbout} 
        setShowAbout={setShowAbout} 
        setShowAIModel={setShowAIModel} 
      />}
      <div className='py-3'></div>
      {showAIModel ? (
        <div id="ai-model">
          <AIModel onBack={() => setShowAIModel(false)} />
        </div>
      ) : (
        <div className="container mx-auto py-8 pt-16"> {/* Added padding-top to account for navbar */}
          <header id="header" className="mb-8 text-center relative">
            {/* <div className="absolute top-0 right-0">
              <button
                onClick={() => setShowAIModel(true)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
              >
                AI Model
              </button>
            </div> */}

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
                Problem Statement
              </button>
              <button
                onClick={handleRedirectToWiki}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Reference
              </button>
            </div>

            <AnimatePresence>
              {showAbout && (
                <motion.div
                  id="about"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden mt-4 mx-auto max-w-3xl"
                >
                  <div className="bg-white p-6 rounded-lg shadow text-left">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Problem Statement & Goal</h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-bold text-blue-700 mb-2">Problem Statement</h4>
                      <p className="text-gray-700 mb-3">
                        Traditional S-Duct designs aim to maximize pressure recovery and flow uniformity, but cross-sectional variations affect aerodynamic performance.
                      </p>
                      <p className="text-gray-700">
                        Optimizing S-Duct shapes for different aircraft types is crucial to reduce turbulence, pressure losses, and secondary flows, enhancing efficiency.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <h4 className="font-bold text-green-700 mb-2">Goal of the Study</h4>
                      <p className="text-gray-700 mb-3">
                        Evaluate and analyze alternative S-Duct configurations to assess their impact on pressure recovery, turbulence, and velocity uniformity.
                      </p>
                      <p className="text-gray-700">
                        Optimize and propose design modifications to enhance efficiency while ensuring structural feasibility for aerospace and automotive applications.
                      </p>
                    </div>

                    <h3 id="challenges" className="text-lg font-bold text-gray-800 mb-3">Aerodynamic Challenges</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-bold text-blue-700 mb-2">Secondary Flow</h4>
                        <p className="text-gray-700">
                          The curvature induces centrifugal forces that create counter-rotating vortices and complex flow patterns.
                        </p>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h4 className="font-bold text-red-700 mb-2">Flow Separation</h4>
                        <p className="text-gray-700">
                          At sharper bend angles, airflow may separate from the duct walls, degrading performance.
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-bold text-green-700 mb-2">Exit Distortion</h4>
                        <p className="text-gray-700">
                          The velocity profile at the duct exit often becomes non-uniform, affecting engine efficiency.
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-3">Why Study S-Ducts?</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-start">
                        <div className="bg-purple-100 rounded-full p-1 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="text-gray-700">Minimizing total pressure loss</p>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-purple-100 rounded-full p-1 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="text-gray-700">Maintaining uniformity at the AIP (aerodynamic interface plane)</p>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-purple-100 rounded-full p-1 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="text-gray-700">Reducing distortion and ensuring engine operability</p>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-purple-100 rounded-full p-1 mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-700">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="text-gray-700">Optimizing overall propulsion system efficiency</p>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg mt-4 border-l-4 border-yellow-500">
                      <h4 className="font-bold text-yellow-700 mb-2">Important Disclaimer</h4>
                      <p className="text-gray-700">
                        Please note that the simulation results displayed may not be completely accurate as they depend on mesh refinement quality, boundary conditions, turbulence modeling, and other simulation parameters. Results should be used for comparative analysis rather than absolute performance predictions.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <div id="simulation">
            <AngleSlider angle={angle} setAngle={setAngle} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              id="results"
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
              
              <div className="mt-6 bg-gray-100 p-4 rounded-lg text-center mx-auto max-w-3xl">
                <p className="text-amber-700 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Simulation results accuracy depends on mesh refinement and simulation conditions. Results should be used for comparative purposes only.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default App;