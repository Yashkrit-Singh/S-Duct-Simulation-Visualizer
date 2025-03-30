import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
  
const PerformanceAnalysis = ({ angle, s_duct_shapes }) => {
  const [activeMetric, setActiveMetric] = useState('Outlet Velocity');
  const [showDescription, setShowDescription] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const contentRef = useRef(null);
  
  // Define bend angles
  const bendAngles = [0, 7.5, 15, 22.5, 30, 37.5, 45];
  
  // Find the closest angle index
  const getClosestAngleIndex = (targetAngle) => {
    return bendAngles.reduce((prev, curr, idx) => 
      Math.abs(curr - targetAngle) < Math.abs(bendAngles[prev] - targetAngle) ? idx : prev, 0);
  };
  
  const angleIndex = getClosestAngleIndex(angle);
  
  // Performance data for all duct types
  const performanceData = {
    "Circle-Circle": {
      "Outlet Velocity": [205.80, 192.33, 178.87, 165.40, 151.93, 138.47, 125.00],
      "Outlet Total Pressure": [100000, 85500, 71000, 56500, 42000, 27500, 13000],
      "Centerline Velocity": [201.68, 188.49, 175.29, 162.09, 148.89, 135.70, 122.50],
      "Velocity Loss": [0, 13.47, 26.93, 40.40, 53.87, 67.33, 80.80],
      "Pressure Loss": [0, 14500, 29000, 43500, 58000, 72500, 87000]
    },
    "Square-Square": {
      "Outlet Velocity": [205.80, 189.67, 173.53, 157.40, 141.27, 125.13, 109.00],
      "Outlet Total Pressure": [100000, 83250, 66500, 49750, 33000, 16250, -500],
      "Centerline Velocity": [201.68, 185.88, 170.06, 154.25, 138.44, 122.63, 106.82],
      "Velocity Loss": [0, 16.13, 32.27, 48.40, 64.53, 80.67, 96.80],
      "Pressure Loss": [0, 16750, 33500, 50250, 67000, 83750, 105000]
    },
    "Square-Circle": {
      "Outlet Velocity": [205.80, 193.67, 181.53, 169.40, 157.27, 145.13, 133.00],
      "Outlet Total Pressure": [100000, 88750, 77500, 66250, 55000, 43750, 32500],
      "Centerline Velocity": [201.68, 189.80, 177.90, 166.01, 154.12, 142.23, 130.34],
      "Velocity Loss": [0, 12.13, 24.27, 36.40, 48.53, 60.67, 72.80],
      "Pressure Loss": [0, 11250, 22500, 33750, 45000, 56250, 67500]
    },
    "Circle-Square": {
      "Outlet Velocity": [205.80, 198.00, 190.20, 182.40, 174.60, 166.80, 159.00],
      "Outlet Total Pressure": [100000, 95125, 90250, 85375, 80500, 75625, 70750],
      "Centerline Velocity": [201.68, 194.04, 186.24, 178.35, 170.61, 163.46, 155.82],
      "Velocity Loss": [0, 7.80, 15.60, 23.40, 31.20, 39.00, 46.80],
      "Pressure Loss": [0, 4875, 9750, 14625, 19500, 24375, 29250]
    }
  };
  
  // Available metrics
  const metrics = [
    "Outlet Velocity", 
    "Outlet Total Pressure", 
    "Centerline Velocity", 
    "Velocity Loss", 
    "Pressure Loss"
  ];
  
  // Map from component naming to JSON data structure naming
  const ductTypeMapping = {
    "Circle-Circle": "circle_inlet_to_circle_outlet",
    "Square-Square": "square_inlet_to_square_outlet",
    "Square-Circle": "square_inlet_to_circle_outlet",
    "Circle-Square": "circle_inlet_to_square_outlet"
  };
  
  // Get descriptions from JSON data
  const getDescriptions = () => {
    const descriptions = {};
    
    if (!s_duct_shapes) return descriptions;
    
    Object.keys(ductTypeMapping).forEach(ductType => {
      const jsonDuctType = ductTypeMapping[ductType];
      const ductData = s_duct_shapes.find(shape => shape.type === jsonDuctType);
      
      if (ductData && ductData.performance && ductData.performance.description) {
        descriptions[ductType] = ductData.performance.description[angleIndex] || {};
      } else {
        descriptions[ductType] = {};
      }
    });
    
    return descriptions;
  };
  
  const descriptions = getDescriptions();
  
  // Prepare data for trend chart (showing how metrics change across all angles)
  const prepareTrendData = () => {
    return bendAngles.map((bendAngle, idx) => {
      const dataPoint = {
        angle: bendAngle
      };
      
      Object.keys(performanceData).forEach(ductType => {
        dataPoint[ductType] = performanceData[ductType][activeMetric][idx];
      });
      
      return dataPoint;
    });
  };
  
  // Prepare data for comparison chart (comparing all duct types at the selected angle)
  const prepareComparisonData = () => {
    return metrics.map(metric => {
      const dataPoint = {
        metric: metric
      };
      
      Object.keys(performanceData).forEach(ductType => {
        dataPoint[ductType] = performanceData[ductType][metric][angleIndex];
      });
      
      return dataPoint;
    });
  };
  
  // Prepare data for the single metric bar chart (all duct types at current angle)
  const prepareBarChartData = () => {
    return Object.keys(performanceData).map(ductType => ({
      name: ductType,
      value: performanceData[ductType][activeMetric][angleIndex]
    }));
  };
  
  // Define colors for each duct type
  const colors = {
    "Circle-Circle": "#8884d8",
    "Square-Square": "#82ca9d",
    "Square-Circle": "#ffc658",
    "Circle-Square": "#ff7300"
  };
  
  const trendData = prepareTrendData();
  const comparisonData = prepareComparisonData();
  const barChartData = prepareBarChartData();
  
  // Custom tooltip format
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold">{`Angle: ${label}°`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Toggle description panel
  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  // PDF Download functionality
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    
    setIsDownloading(true);
    
    try {
      // Force the description panel to be visible for PDF generation
      const wasDescriptionVisible = showDescription;
      if (!wasDescriptionVisible) {
        setShowDescription(true);
        // Wait for state update and re-render
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const content = contentRef.current;
      
      const canvas = await html2canvas(content, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate positioning to maintain aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Add metadata
      pdf.setProperties({
        title: `S-Duct Performance Analysis - ${activeMetric} at ${bendAngles[angleIndex]}°`,
        subject: 'S-Duct Performance Analysis',
        creator: 'S-Duct Analyzer Tool',
        keywords: 'CFD, S-Duct, Performance Analysis'
      });
      
      // Save PDF
      pdf.save(`s-duct-analysis-${bendAngles[angleIndex]}deg-${activeMetric.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      // Restore previous description panel state
      if (!wasDescriptionVisible) {
        setShowDescription(false);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className="flex flex-col">
      {/* Header with download button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Performance Analysis</h2>
        <div className="flex space-x-2">
          <button 
            onClick={toggleDescription}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
          >
            {showDescription ? 'Hide Details' : 'Show Details'}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
          >
            {isDownloading ? 'Generating...' : 'Download PDF'}
            <Printer className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
      
      <div ref={contentRef} className="flex flex-row">
        <div className={`bg-white rounded-lg shadow-lg p-6 my-8 ${showDescription ? 'w-2/3 mr-4' : 'w-full'}`}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Select Metric:</label>
            <div className="flex flex-wrap gap-2">
              {metrics.map(metric => (
                <button
                  key={metric}
                  className={`px-4 py-2 rounded ${activeMetric === metric 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  onClick={() => setActiveMetric(metric)}
                >
                  {metric}
                </button>
              ))}
            </div>
          </div>
          
          {/* Current angle data visualization */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{activeMetric} at {bendAngles[angleIndex]}° Bend</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8">
                    {barChartData.map((entry, index) => (
                      <Bar key={index} dataKey="value" fill={Object.values(colors)[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Trend across all angles */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{activeMetric} Trend Across All Angles</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="angle" label={{ value: 'Bend Angle (degrees)', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.keys(performanceData).map((ductType, index) => (
                    <Line 
                      key={ductType}
                      type="monotone" 
                      dataKey={ductType} 
                      stroke={colors[ductType]} 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Comparison table for current angle */}
          <div>
            <h3 className="text-xl font-semibold mb-4">All Metrics at {bendAngles[angleIndex]}° Bend</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border-b text-left">Metric</th>
                    {Object.keys(performanceData).map(ductType => (
                      <th key={ductType} className="py-3 px-4 border-b text-left">{ductType}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, index) => (
                    <tr key={metric} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b font-medium">{metric}</td>
                      {Object.keys(performanceData).map(ductType => (
                        <td key={ductType} className="py-3 px-4 border-b">
                          {performanceData[ductType][metric][angleIndex].toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Description Panel */}
        {showDescription && (
          <div className="w-1/3 bg-white rounded-lg shadow-lg p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Metric Description</h2>
            
            <div className="border-b pb-4 mb-4">
              <h3 className="text-xl font-semibold mb-2">{activeMetric}</h3>
              <p className="text-gray-600 mb-4">
                Selected angle: {bendAngles[angleIndex]}°
              </p>
            </div>
            
            {Object.keys(ductTypeMapping).map(ductType => (
              <div key={ductType} className="mb-6">
                <h4 className="text-lg font-medium mb-2 flex items-center">
                  <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colors[ductType] }}></span>
                  {ductType}
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {descriptions[ductType] && descriptions[ductType][activeMetric] ? (
                    <p>{descriptions[ductType][activeMetric]}</p>
                  ) : (
                    <p className="text-gray-500 italic">Description not available for this configuration</p>
                  )}
                  <div className="mt-4">
                    <p className="font-medium">Performance Value:</p>
                    <p className="text-lg font-bold text-blue-600">
                      {performanceData[ductType][activeMetric][angleIndex].toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-md font-medium mb-2">Note</h4>
              <p className="text-sm text-gray-600">
                The descriptions above provide detailed information about how each duct type performs 
                at the selected metric and angle. Select different metrics using the buttons on the left panel 
                to see corresponding descriptions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceAnalysis;