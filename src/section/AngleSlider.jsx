import React, { useState, useEffect } from "react";
import { Slider } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const bendAngles = [0, 7.5, 15, 22.5, 30, 37.5, 45];

const getNearestAngle = (value) => {
  return bendAngles.reduce((prev, curr) =>
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
};

const AngleSlider = ({ angle, setAngle }) => {
  // Add a display angle state that will animate smoothly to the actual angle
  const [displayAngle, setDisplayAngle] = useState(angle);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Smoothly animate to the new angle when it changes
  useEffect(() => {
    // Start the animation
    setIsAnimating(true);
    
    // Animate the display angle to the actual angle
    const animationDuration = 800; // ms
    const steps = 20;
    const stepTime = animationDuration / steps;
    const angleChange = angle - displayAngle;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      // Use easeInOut formula for smoother animation
      const progress = step / steps;
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      setDisplayAngle(prevAngle => {
        const newAngle = displayAngle + angleChange * easedProgress;
        return Number(newAngle.toFixed(1));
      });
      
      if (step >= steps) {
        clearInterval(interval);
        setDisplayAngle(angle);
        setIsAnimating(false);
      }
    }, stepTime);
    
    return () => clearInterval(interval);
  }, [angle]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (event, newValue) => {
    const nearestAngle = getNearestAngle(newValue);
    setAngle(nearestAngle);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-3/4 mx-auto flex flex-col items-center p-6 bg-white text-black rounded-lg shadow-lg"
    >
      {/* Replacement for the problematic element */}
      <motion.div 
        className="mb-4 h-16 flex items-center justify-center"
        animate={{ scale: isAnimating ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`angle-${displayAngle}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold"
            >
              <span>Current Angle: </span>
              <span className="text-green-500">{displayAngle.toFixed(1)}°</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      
      <p className="text-sm text-gray-600 mb-6">
        Select the bending angle of the centerline to see the simulation results.
      </p>

      {/* Angle indicators */}
      <div className="w-full max-w-sm mb-1 flex justify-between px-1 relative">
        {bendAngles.map((mark) => (
          <motion.div 
            key={mark}
            onClick={() => setAngle(mark)}
            className={`cursor-pointer text-xs font-medium transition-colors duration-300 ${
              Math.abs(displayAngle - mark) < 0.1 ? "text-green-500 font-bold" : "text-gray-400"
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {mark}°
          </motion.div>
        ))}
      </div>

      {/* Progress bar under slider */}
      <div className="w-full max-w-sm h-1 bg-gray-200 rounded-full mb-2 relative overflow-hidden">
        <motion.div 
          className="h-full bg-green-500 absolute top-0 left-0"
          initial={{ width: `${(angle / 45) * 100}%` }}
          animate={{ width: `${(displayAngle / 45) * 100}%` }}
          transition={{ type: "spring", damping: 15 }}
        />
      </div>

      <div className="w-full max-w-sm">
        <Slider
          value={displayAngle}
          onChange={handleChange}
          min={0}
          max={45}
          step={0.1}
          marks={bendAngles.map(value => ({ value, label: '' }))}
          sx={{ 
            width: '100%', 
            color: "#10B981",
            '& .MuiSlider-mark': {
              backgroundColor: '#d1d5db',
              height: 8,
              width: 2,
              marginTop: -3
            },
            '& .MuiSlider-markActive': {
              backgroundColor: '#10B981',
            }
          }}
        />
      </div>

      {/* Quick select buttons */}
      <div className="flex gap-4 mt-4 w-full max-w-sm justify-center">
        {[0, 15, 30, 45].map((presetAngle) => (
          <motion.button
            key={presetAngle}
            onClick={() => setAngle(presetAngle)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              Math.abs(displayAngle - presetAngle) < 0.1
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
          >
            {presetAngle}°
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default AngleSlider;