// NavBar.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const NavBar = ({ showAbout, setShowAbout, setShowAIModel }) => {
  const [activeSection, setActiveSection] = useState('header');

  // Define the sections for navigation
  const sections = [
    { id: 'header', label: 'Home' },
    { id: 'about', label: 'About', action: () => setShowAbout(true) },
    { id: 'simulation', label: 'Simulation' },
    { id: 'results', label: 'Results' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'ai-model', label: 'AI Model', action: () => setShowAIModel(true) }
  ];

  // Handle scroll to section or trigger action
  const handleNavigation = (section) => {
    // If there's a special action for this section, perform it
    if (section.action) {
      section.action();
    }
    
    // Also scroll to the section if it exists
    const element = document.getElementById(section.id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    
    setActiveSection(section.id);
  };

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Determine which section is currently in view
      let currentSection = '';
      sections.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = id;
          }
        }
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto">
        <div className="flex justify-center md:justify-between items-center py-3 px-4">
          <div className="hidden md:block">
            <h2 className="text-white font-bold text-xl">S-Duct Visualizer</h2>
          </div>
          
          <ul className="flex space-x-1 md:space-x-4 overflow-x-auto no-scrollbar">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => handleNavigation(section)}
                  className={`px-3 py-2 rounded-full text-sm md:text-base transition-all duration-300 ${
                    activeSection === section.id
                      ? 'bg-white text-blue-600 font-medium shadow-md'
                      : 'text-white hover:bg-white hover:bg-opacity-20'
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;