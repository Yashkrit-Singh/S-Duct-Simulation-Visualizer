import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import PerformanceAnalysis from './section/PerformanceAnalysis';

// Create a custom slider component for the AI Model page
const CustomRangeInput = ({ label, min, max, step, value, onChange, unit }) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="font-medium text-gray-700">{label}</label>
        <span className="text-gray-600 font-medium">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};

// Create a custom number input component
const CustomNumberInput = ({ label, min, max, step, value, onChange, unit }) => {
  return (
    <div className="mb-6">
      <label className="block font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            if (val >= min && val <= max) {
              onChange(val);
            }
          }}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="ml-2 text-gray-600">{unit}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Min: {min} {unit}</span>
        <span>Max: {max} {unit}</span>
      </div>
    </div>
  );
};

// Create a shape selector component
const ShapeSelector = ({ shapes, selectedShape, onSelect }) => {
  return (
    <div className="mb-6">
      <label className="block font-medium text-gray-700 mb-2">Select S-Duct Shape</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shapes.map((shape) => (
          <div
            key={shape.id}
            onClick={() => onSelect(shape.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedShape === shape.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-300'
            }`}
          >
            <h3 className="font-medium text-center">{shape.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

// Data interpolation function
const interpolateData = (baseData, angle, velocity) => {
  // Base velocity in the dataset
  const baseVelocity = 208;
  
  // Find the two closest angles in the dataset
  const bendAngles = baseData.bend_angles;
  let lowerIndex = 0;
  let upperIndex = 0;
  
  for (let i = 0; i < bendAngles.length; i++) {
    if (angle >= bendAngles[i]) {
      lowerIndex = i;
    }
    if (angle <= bendAngles[i]) {
      upperIndex = i;
      break;
    }
  }
  
  // If angle is exactly one of the bend angles, no interpolation needed for angle
  const exactAngle = angle === bendAngles[lowerIndex];
  
  // Calculate interpolation factor for angle
  const angleFactor = exactAngle ? 0 : (angle - bendAngles[lowerIndex]) / (bendAngles[upperIndex] - bendAngles[lowerIndex]);
  
  // Calculate velocity scaling factor (with some non-linearity for realism)
  const velocityFactor = Math.pow(velocity / baseVelocity, 1.2);
  
  // Add some randomness for realism
  const randomFactor = () => 1 + (Math.random() * 0.1 - 0.05); // ±5% randomness
  
  // Perform interpolation for each performance metric
  const interpolatedData = {};
  
  for (const metric in baseData.performance) {
    if (exactAngle) {
      // Exact angle match, just scale by velocity
      interpolatedData[metric] = baseData.performance[metric][lowerIndex] * velocityFactor * randomFactor();
    } else {
      // Interpolate between two angles
      const lowerValue = baseData.performance[metric][lowerIndex];
      const upperValue = baseData.performance[metric][upperIndex];
      const interpolatedValue = lowerValue + angleFactor * (upperValue - lowerValue);
      
      // Scale by velocity factor
      interpolatedData[metric] = interpolatedValue * velocityFactor * randomFactor();
    }
  }
  
  return interpolatedData;
};

// Mock S-duct shapes base data
const sdShapesBaseData = {
  "circle-circle": {
    "type": "circle_inlet_to_circle_outlet",
    "bend_angles": [0, 7.5, 15, 22.5, 30, 37.5, 45],
    "performance": {
      "Outlet Velocity": [125.9, 117.1, 106.8, 98.4, 89.7, 81.8, 75.3],
      "Outlet Total Pressure": [106000, 89000, 77000, 70000, 55000, 44500, 38500],
      "Centerline Velocity": [181.52, 179.83, 178.15, 176.47, 174.79, 173.11, 171.43],
      "Velocity Loss": [38.82, 45.12, 52.10, 58.22, 64.30, 70.25, 75.10],
      "Pressure Loss": [-6.00, 11.00, 23.00, 30.00, 45.00, 55.50, 61.50]
    },
    "description": {
      "Outlet Velocity": "Circle to Circle configuration provides smooth flow transitions with moderate velocity preservation.",
      "Outlet Total Pressure": "Pressure distribution remains relatively uniform with minimal losses.",
      "Centerline Velocity": "Flow along centerline maintains stability with gradual reduction.",
      "Velocity Loss": "Minimal velocity loss due to streamlined geometry.",
      "Pressure Loss": "Low pressure losses observed due to smooth transitions."
    }
  },
  "circle-square": {
    "type": "circle_inlet_to_square_outlet",
    "bend_angles": [0, 7.5, 15, 22.5, 30, 37.5, 45],
    "performance": {
      "Outlet Velocity": [130.2, 122.4, 114.3, 106.1, 97.8, 90.2, 84.5],
      "Outlet Total Pressure": [102000, 87000, 76000, 68000, 59000, 51000, 46000],
      "Centerline Velocity": [182.30, 180.85, 179.40, 177.95, 176.50, 175.05, 173.60],
      "Velocity Loss": [35.24, 41.32, 47.40, 53.48, 59.56, 65.64, 71.72],
      "Pressure Loss": [-2.00, 13.00, 24.00, 32.00, 41.00, 49.00, 54.00]
    },
    "description": {
      "Outlet Velocity": "Circle to Square configuration preserves velocity best among transitions.",
      "Outlet Total Pressure": "High pressure recovery with minimal losses during transition.",
      "Centerline Velocity": "Most stable centerline velocity profile among all configurations.",
      "Velocity Loss": "Lowest velocity loss due to favorable inlet conditions.",
      "Pressure Loss": "Minimal pressure losses as flow expands gradually into square outlet."
    }
  },
  "square-square": {
    "type": "square_inlet_to_square_outlet",
    "bend_angles": [0, 7.5, 15, 22.5, 30, 37.5, 45],
    "performance": {
      "Outlet Velocity": [118.7, 107.9, 97.2, 88.6, 80.5, 73.2, 67.1],
      "Outlet Total Pressure": [97000, 79000, 64000, 53000, 44000, 37000, 32000],
      "Centerline Velocity": [175.40, 173.25, 171.10, 168.95, 166.80, 164.65, 162.50],
      "Velocity Loss": [45.23, 52.34, 59.45, 66.56, 73.67, 80.78, 87.89],
      "Pressure Loss": [3.00, 21.00, 36.00, 47.00, 56.00, 63.00, 68.00]
    },
    "description": {
      "Outlet Velocity": "Square to Square configuration creates corner vortices that reduce overall velocity.",
      "Outlet Total Pressure": "Significant pressure losses at corners reduce total pressure recovery.",
      "Centerline Velocity": "Flow separation at corners impacts centerline velocity stability.",
      "Velocity Loss": "Higher velocity losses due to corner flow interactions.",
      "Pressure Loss": "Most significant pressure losses among configurations due to geometric discontinuities."
    }
  },
  "square-circle": {
    "type": "square_inlet_to_circle_outlet",
    "bend_angles": [0, 7.5, 15, 22.5, 30, 37.5, 45],
    "performance": {
      "Outlet Velocity": [123.4, 113.8, 104.5, 96.7, 89.2, 82.3, 76.8],
      "Outlet Total Pressure": [99000, 84000, 72000, 63000, 55000, 48000, 42000],
      "Centerline Velocity": [178.62, 176.74, 174.86, 172.98, 171.10, 169.22, 167.34],
      "Velocity Loss": [41.03, 47.52, 54.01, 60.50, 66.99, 73.48, 79.97],
      "Pressure Loss": [1.00, 16.00, 28.00, 37.00, 45.00, 52.00, 58.00]
    },
    "description": {
      "Outlet Velocity": "Square to Circle configuration shows improved outlet velocity from expanding flow.",
      "Outlet Total Pressure": "Moderate pressure recovery as flow transitions from corners to circular profile.",
      "Centerline Velocity": "Gradual improvement in flow regularity towards outlet.",
      "Velocity Loss": "Moderate velocity losses from inlet turbulence that stabilizes towards outlet.",
      "Pressure Loss": "Medium pressure losses primarily at the inlet corners."
    }
  }
};

// Main AIModel component
function AIModel({ onBack }) {
  const [angle, setAngle] = useState(15);
  const [velocity, setVelocity] = useState(150);
  const [selectedShape, setSelectedShape] = useState('circle-circle');
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showPerformanceAnalysis, setShowPerformanceAnalysis] = useState(false);
  const [interpolatedSDuctData, setInterpolatedSDuctData] = useState(null);

  // Shape data for the four S-duct configurations
  const shapes = [
    { id: 'circle-circle', name: 'Circle to Circle' },
    { id: 'circle-square', name: 'Circle to Square' },
    { id: 'square-square', name: 'Square to Square' },
    { id: 'square-circle', name: 'Square to Circle' }
  ];

  // Calculate results based on inputs
  const calculateResults = () => {
    // Get base data for selected shape
    const baseData = sdShapesBaseData[selectedShape];
    
    // Interpolate data based on angle and velocity
    const interpolatedData = interpolateData(baseData, angle, velocity);
    
    // Format results for display
    const pressureDrop = Math.abs(interpolatedData["Pressure Loss"]).toFixed(2);
    const totalPressureRecovery = (interpolatedData["Outlet Total Pressure"] / 101325).toFixed(4);
    const distortionCoefficient = (
      (Math.max(...baseData.performance["Outlet Velocity"]) - interpolatedData["Outlet Velocity"]) / 
      Math.max(...baseData.performance["Outlet Velocity"]) * 0.8
    ).toFixed(4);
    const flowUniformity = (
      (1 - interpolatedData["Velocity Loss"] / 100) * 100
    ).toFixed(2) + '%';
    
    // Prepare S-duct shape data for performance analysis
    const updatedSDuctShapes = Object.keys(sdShapesBaseData).map(key => {
      const data = sdShapesBaseData[key];
      // Include the interpolated performance metrics for the current angle and velocity
      return {
        type: data.type,
        performance: {
          description: [
            data.description
          ]
        },
        // Add the numerical interpolated values
        interpolatedMetrics: key === selectedShape ? interpolatedData : null
      };
    });
    
    setInterpolatedSDuctData(updatedSDuctShapes);
    
    return {
      pressureDrop,
      totalPressureRecovery,
      distortionCoefficient,
      flowUniformity,
      rawData: interpolatedData
    };
  };

  // Effect to simulate calculation
  useEffect(() => {
    if (isCalculating) {
      const timer = setTimeout(() => {
        const calculatedResults = calculateResults();
        setResults(calculatedResults);
        setIsCalculating(false);
        setShowResults(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isCalculating, angle, velocity, selectedShape]);

  const handleCalculate = () => {
    setIsCalculating(true);
    setResults(null);
    setShowPerformanceAnalysis(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <header className="mb-8 text-center relative">
          <div className="absolute top-0 left-0">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ← Back
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            S-Duct AI Model Simulator
          </h1>
          <p className="text-gray-600">
            Enter custom parameters to predict S-Duct performance
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Input Parameters</h2>
            
            {/* Angle input */}
            <CustomNumberInput
              label="Bend Angle"
              min={0}
              max={45}
              step={0.1}
              value={angle}
              onChange={setAngle}
              unit="degrees"
            />
            
            <CustomRangeInput
              label="Bend Angle"
              min={0}
              max={45}
              step={0.1}
              value={angle}
              onChange={setAngle}
              unit="degrees"
            />
            
            {/* Velocity input */}
            <CustomNumberInput
              label="Inlet Velocity"
              min={68}
              max={275}
              step={1}
              value={velocity}
              onChange={setVelocity}
              unit="m/s"
            />
            
            <CustomRangeInput
              label="Inlet Velocity"
              min={68}
              max={275}
              step={1}
              value={velocity}
              onChange={setVelocity}
              unit="m/s"
            />
            
            {/* Shape selector */}
            <ShapeSelector
              shapes={shapes}
              selectedShape={selectedShape}
              onSelect={setSelectedShape}
            />
            
            <button
              onClick={handleCalculate}
              disabled={isCalculating}
              className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${
                isCalculating ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isCalculating ? 'Calculating...' : 'Calculate Results'}
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Predicted Results</h2>
            
            {isCalculating ? (
              <div className="flex flex-col items-center justify-center h-64">
                <motion.div
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="mt-4 text-gray-700">Processing with AI model...</p>
              </div>
            ) : showResults ? (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Pressure Drop</h3>
                      <p className="text-2xl font-bold text-gray-800">{results.pressureDrop} Pa</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Total Pressure Recovery</h3>
                      <p className="text-2xl font-bold text-gray-800">{results.totalPressureRecovery}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Distortion Coefficient</h3>
                      <p className="text-2xl font-bold text-gray-800">{results.distortionCoefficient}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Flow Uniformity</h3>
                      <p className="text-2xl font-bold text-gray-800">{results.flowUniformity}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-2">Detailed Metrics</h3>
                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {results.rawData && Object.entries(results.rawData).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-gray-700">{key}:</span>
                          <span className="font-medium">
                            {typeof value === 'number' 
                              ? key.includes('Pressure') 
                                ? value.toFixed(0) + ' Pa' 
                                : value.toFixed(2) + (key.includes('Velocity') ? ' m/s' : '')
                              : value}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-center">
                      <button 
                        onClick={() => setShowPerformanceAnalysis(!showPerformanceAnalysis)}
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        {showPerformanceAnalysis ? 'Hide Detailed Performance Analysis' : 'Show Detailed Performance Analysis'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>Enter parameters and click Calculate to see results</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Performance Analysis Section */}
        {showPerformanceAnalysis && showResults && interpolatedSDuctData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mt-8"
          >
            <div className="bg-white p-6 rounded-lg shadow">
              <PerformanceAnalysis 
                angle={angle} 
                s_duct_shapes={interpolatedSDuctData}
                selectedShape={selectedShape}
                interpolatedData={results.rawData}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AIModel;