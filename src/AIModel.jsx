import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import PerformanceAnalysis from './section/PerformanceAnalysis';

// Custom slider component
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

// Custom number input component
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

// Shape selector component
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

// Component to show Model Evaluation Metrics and Data Split
const ModelMetricsDisplay = () => {
  const metrics = [
    { 
      title: "Outlet Velocity (m/s)", 
      r2: 0.9988, 
      rmse: 1.11,
      color: "from-blue-400 to-blue-600" 
    },
    { 
      title: "Outlet Pressure (Pa)", 
      r2: 1.0000, 
      rmse: 97.83,
      color: "from-purple-400 to-purple-600" 
    },
    { 
      title: "Velocity Loss (%)", 
      r2: 0.9998, 
      rmse: 0.18,
      color: "from-teal-400 to-teal-600" 
    },
    { 
      title: "Pressure Loss (%)", 
      r2: 1.0000, 
      rmse: 0.09,
      color: "from-amber-400 to-amber-600" 
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl shadow-lg mt-8 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Model Evaluation Metrics
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-100">
            <div className={`bg-gradient-to-r ${metric.color} h-2`}></div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-2">{metric.title}</h3>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-500">R² Score</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div className={`bg-gradient-to-r ${metric.color} h-2 rounded-full`} style={{ width: `${metric.r2 * 100}%` }}></div>
                  </div>
                  <span className="font-mono font-medium">{metric.r2.toFixed(4)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">RMSE</span>
                <span className="font-mono font-medium">{metric.rmse.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
          Data Split
        </h3>
        <div className="flex items-center mt-2">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-l-full text-xs text-white flex items-center justify-center" style={{ width: "80%" }}>80%</div>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Training Data (80%)</span>
          <span>Testing Data (20%)</span>
        </div>
      </div>
    </div>
  );
};

function AIModel({ onBack }) {
  // Local state for user inputs and results
  const [angle, setAngle] = useState(15);
  const [velocity, setVelocity] = useState(150);
  const [selectedShape, setSelectedShape] = useState('Circle-Circle');
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showPerformanceAnalysis, setShowPerformanceAnalysis] = useState(false);

  // Shape data for the S-duct configurations
  const shapes = [
    { id: 'Circle-Circle', name: 'Circle to Circle' },
    { id: 'Circle-Square', name: 'Circle to Square' },
    { id: 'Square-Square', name: 'Square to Square' },
    { id: 'Square-Circle', name: 'Square to Circle' }
  ];

  // Function to POST data to the Flask backend for prediction
  const handleCalculate = async () => {
    const machNumber = velocity / 343;
    const payload = {
      "Mach Number": machNumber,
      "Angle": angle,
      "Inlet Velocity (m/s)": velocity,
      "Inlet Pressure (Pa)": 1e5,
      "Geometry": selectedShape
    };

    setIsCalculating(true);
    setResults(null);
    setShowPerformanceAnalysis(false);

    try {
      const response = await axios.post('http://127.0.0.1:5000/predict', payload);
      setResults(response.data);
      setShowResults(true);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      alert("Prediction failed. Check the console for details.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50" id="ai-model">
      {/* Added padding-top to create space for the fixed navbar */}
      <div className="container mx-auto py-8 pt-24">
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
          {/* Input Parameters Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Input Parameters</h2>
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
          
          {/* Predicted Results Section */}
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
            ) : showResults && results ? (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Outlet Velocity (m/s)</h3>
                      <p className="text-2xl font-bold text-gray-800">
                        {results["Outlet Velocity (m/s)"].toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Outlet Pressure (Pa)</h3>
                      <p className="text-2xl font-bold text-gray-800">
                        {results["Outlet Pressure (Pa)"].toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Velocity Loss (%)</h3>
                      <p className="text-2xl font-bold text-gray-800">
                        {results["Velocity Loss (%)"].toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-500">Pressure Loss (%)</h3>
                      <p className="text-2xl font-bold text-gray-800">
                        {results["Pressure Loss (%)"].toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>Enter parameters and click Calculate to see results</p>
              </div>
            )}
            
            {/* Updated Metrics Display */}
            <ModelMetricsDisplay />
          </div>
        </div>
        
        {showResults && results && (
          <div className="mt-8">
            <PerformanceAnalysis results={results} angle={angle} velocity={velocity} shape={selectedShape} />
          </div>
        )}
      </div>
    </div>
  );
}

export default AIModel;