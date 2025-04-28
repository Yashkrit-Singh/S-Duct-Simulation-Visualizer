import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
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
    return bendAngles.reduce(
      (prev, curr, idx) =>
        Math.abs(curr - targetAngle) < Math.abs(bendAngles[prev] - targetAngle) ? idx : prev,
      0
    );
  };
  
  const angleIndex = getClosestAngleIndex(angle);
  
  // Define colors and shapes for each duct type
  const ductTypes = [
    { key: "Circle-Circle", color: "#8884d8", shape: "circle" },
    { key: "Square-Square", color: "#82ca9d", shape: "square" },
    { key: "Square-Circle", color: "#ffc658", shape: "diamond" },
    { key: "Circle-Square", color: "#ff7300", shape: "triangle" }
  ];
  
  // Create colors object for backward compatibility
  const colors = ductTypes.reduce((acc, duct) => {
    acc[duct.key] = duct.color;
    return acc;
  }, {});
  
  // Performance data with pressure values for "Outlet Total Pressure" converted to kPa
  // and "Pressure Loss" values kept as percentages.
  const performanceData = {
    "Circle-Circle": {
      "Outlet Velocity": [125.9, 117.1, 106.8, 98.4, 89.7, 81.8, 75.3],
      "Outlet Total Pressure": [106000, 89000, 77000, 70000, 55000, 44500, 38500].map(val => val / 1000),
      "Velocity Loss": [38.82, 45.12, 52.10, 58.22, 64.30, 70.25, 75.10],
      "Pressure Loss": [-6.00, 11.00, 23.00, 30.00, 45.00, 55.50, 61.50],
      "Centerline Velocity": [201.68, 188.49, 175.29, 162.09, 148.89, 135.70, 122.50],
    },
    "Square-Square": {
      "Outlet Velocity": [119.80, 110.60, 101.50, 94.70, 86.40, 79.50, 72.90],
      "Outlet Total Pressure": [109500, 95000, 81500, 73500, 58000, 47000, 40500].map(val => val / 1000),
      "Velocity Loss": [41.79, 49.08, 55.40, 61.50, 67.70, 73.15, 78.90],
      "Pressure Loss": [-9.50, 5.00, 18.50, 26.50, 42.00, 53.00, 59.50],
      "Centerline Velocity": [201.68, 185.88, 170.06, 154.25, 138.44, 122.63, 106.82],
    },
    "Square-Circle": {
      "Outlet Velocity": [121.90, 112.80, 103.20, 96.10, 87.40, 79.80, 73.20],
      "Outlet Total Pressure": [103000, 87500, 74000, 67000, 52000, 40500, 34000].map(val => val / 1000),
      "Velocity Loss": [40.76, 48.50, 55.90, 62.15, 68.90, 74.80, 80.40],
      "Pressure Loss": [-3.00, 12.50, 26.00, 33.00, 48.00, 59.50, 66.00],
      "Centerline Velocity": [201.68, 189.80, 177.90, 166.01, 154.12, 142.23, 130.34],
    },
    "Circle-Square": {
      "Outlet Velocity": [113.31, 103.50, 94.50, 88.20, 79.20, 71.10, 64.80],
      "Outlet Total Pressure": [111340, 98000, 87010, 79100, 62150, 50285, 43505].map(val => val / 1000),
      "Velocity Loss": [44.94, 52.00, 58.80, 65.10, 71.70, 77.80, 83.40],
      "Pressure Loss": [-11.34, 2.00, 12.99, 20.90, 37.85, 49.71, 56.49],
      "Centerline Velocity": [201.68, 194.04, 186.24, 178.35, 170.61, 163.46, 155.82],
    }
  };
  
  // Define units for each metric  
  const metricUnits = {
    "Outlet Velocity": "m/s",
    "Outlet Total Pressure": "kPa",
    "Centerline Velocity": "m/s",
    "Velocity Loss": "%",
    "Pressure Loss": "%"
  };
  
  // Available metrics to select from
  const metrics = [
    "Outlet Velocity", 
    "Outlet Total Pressure", 
    "Centerline Velocity", 
    "Velocity Loss", 
    "Pressure Loss"
  ];
  
  // Mapping between display name and JSON data structure naming
  const ductTypeMapping = {
    "Circle-Circle": "circle_inlet_to_circle_outlet",
    "Square-Square": "square_inlet_to_square_outlet",
    "Square-Circle": "square_inlet_to_circle_outlet",
    "Circle-Square": "circle_inlet_to_square_outlet"
  };
  
  // Get descriptions from JSON data (if provided)
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
  
  // Prepare data for a trend chart across all angles
  const prepareTrendData = (metric) => {
    return bendAngles.map((bendAngle, idx) => {
      const dataPoint = { angle: bendAngle };
      Object.keys(performanceData).forEach(ductType => {
        dataPoint[ductType] = performanceData[ductType][metric][idx];
      });
      return dataPoint;
    });
  };
  
  // Prepare data for a comparison chart at the selected angle
  const prepareComparisonData = () => {
    return metrics.map(metric => {
      const dataPoint = { metric };
      Object.keys(performanceData).forEach(ductType => {
        dataPoint[ductType] = performanceData[ductType][metric][angleIndex];
      });
      return dataPoint;
    });
  };
  
  // Prepare data for a single metric bar chart at the current angle
  const prepareBarChartData = (metric) => {
    return Object.keys(performanceData).map(ductType => ({
      name: ductType,
      value: performanceData[ductType][metric][angleIndex],
      ductType: ductType
    }));
  };
  
  const trendData = prepareTrendData(activeMetric);
  const comparisonData = prepareComparisonData();
  const barChartData = prepareBarChartData(activeMetric);
  
  // Function to render custom shape (from first file)
  const renderCustomShape = (type, cx, cy, size, fill) => {
    switch(type) {
      case 'square':
        const squareSize = size * 1.5;
        return (
          <rect
            x={cx - squareSize/2}
            y={cy - squareSize/2}
            width={squareSize}
            height={squareSize}
            fill={fill}
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${cx},${cy-size} ${cx+size},${cy} ${cx},${cy+size} ${cx-size},${cy}`}
            fill={fill}
          />
        );
      case 'triangle':
        return (
          <polygon
            points={`${cx},${cy-size} ${cx+size},${cy+size} ${cx-size},${cy+size}`}
            fill={fill}
          />
        );
      case 'circle':
      default:
        return <circle cx={cx} cy={cy} r={size} fill={fill} />;
    }
  };
  
  // Custom dot for line charts
  const CustomDot = (props) => {
    const { cx, cy, stroke, payload, dataKey } = props;
    
    const ductType = ductTypes.find(d => d.key === dataKey);
    if (!ductType) return null;
    
    return renderCustomShape(ductType.shape, cx, cy, 5, ductType.color);
  };
  
  // Custom tooltip for line chart with units
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold">{`Angle: ${label}°`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toLocaleString()} ${metricUnits[activeMetric] || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for bar chart with units
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow-md">
          <p className="font-bold">{data.name}</p>
          <p style={{ color: colors[data.ductType] }}>
            {`${activeMetric}: ${data.value.toLocaleString()} ${metricUnits[activeMetric] || ''}`}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom legend
  const CustomLegend = () => {
    return (
      <div className="flex justify-center items-center mt-4 space-x-8">
        {ductTypes.map((duct, index) => (
          <div key={index} className="flex items-center">
            <svg width="20" height="20" className="mr-2">
              {renderCustomShape(duct.shape, 10, 10, 6, duct.color)}
            </svg>
            <span>{duct.key}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Toggle the description panel visibility
  const toggleDescription = () => {
    setShowDescription(!showDescription);
  };

  // Wait for state updates to reflect in the DOM before proceeding
  const waitForStateUpdate = () => {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 300);
      });
    });
  };

  // Capture component as an image using html2canvas
  const captureComponentAsImage = async (element) => {
    if (!element) return null;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    return canvas.toDataURL('image/png');
  };

  // Add a title page and table of contents to the PDF report
  const addTitlePage = (pdf) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.text('S-Duct Performance Analysis Report', pageWidth / 2, 40, { align: 'center' });
    pdf.setFontSize(18);
    pdf.text(`Bend Angle: ${bendAngles[angleIndex]}°`, pageWidth / 2, 60, { align: 'center' });
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    pdf.text(`Generated on: ${formattedDate}`, pageWidth / 2, 75, { align: 'center' });
    pdf.setFontSize(20);
    pdf.text('Table of Contents', pageWidth / 2, 100, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    let yPosition = 120;
    metrics.forEach((metric, index) => {
      pdf.text(`${index + 1}. ${metric} (${metricUnits[metric]})`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
    });
    pdf.setDrawColor(100, 100, 100);
    pdf.setLineWidth(0.5);
    pdf.line(40, pageHeight - 40, pageWidth - 40, pageHeight - 40);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('S-Duct Analyzer - Comprehensive Performance Report', pageWidth / 2, pageHeight - 30, { align: 'center' });
  };

  // Handle PDF download with full report generation
  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsDownloading(true);
    try {
      const wasDescriptionVisible = showDescription;
      const previousMetric = activeMetric;
      setShowDescription(true);
      await waitForStateUpdate();
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      pdf.setProperties({
        title: `S-Duct Performance Analysis at ${bendAngles[angleIndex]}°`,
        subject: 'S-Duct Performance Analysis',
        creator: 'S-Duct Analyzer Tool',
        keywords: 'CFD, S-Duct, Performance Analysis'
      });
      
      addTitlePage(pdf);
      
      for (let i = 0; i < metrics.length; i++) {
        const metric = metrics[i];
        setActiveMetric(metric);
        await waitForStateUpdate();
        const imgData = await captureComponentAsImage(contentRef.current);
        if (!imgData) continue;
        pdf.addPage();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`${i + 1}. ${metric} (${metricUnits[metric]})`, 10, 10);
      }
      
      pdf.save(`s-duct-analysis-${bendAngles[angleIndex]}deg-all-metrics.pdf`);
      
      setActiveMetric(previousMetric);
      setShowDescription(wasDescriptionVisible);
      await waitForStateUpdate();
      
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
            {isDownloading ? 'Generating...' : 'Download All Metrics PDF'}
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
                  {metric} ({metricUnits[metric]})
                </button>
              ))}
            </div>
          </div>
          
          {/* Current angle data visualization */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{activeMetric} ({metricUnits[activeMetric]}) at {bendAngles[angleIndex]}° Bend</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: metricUnits[activeMetric], angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend />
                  <Bar dataKey="value">
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[entry.ductType]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Trend chart with custom shapes */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">{activeMetric} ({metricUnits[activeMetric]}) Trend Across All Angles</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ResponsiveContainer width="100%" height={300}>
             
<LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis 
    dataKey="angle" 
    label={{ 
      value: 'Bend Angle (degrees)', 
      position: 'insideBottom', 
      offset: -20,
      style: { textAnchor: 'middle' }
    }} 
  />
  <YAxis 
    label={{ 
      value: `${activeMetric} (${metricUnits[activeMetric]})`, 
      angle: -90, 
      position: 'insideLeft',
      style: { textAnchor: 'middle' },
      offset: -10
    }} 
  />
  <Tooltip content={<CustomTooltip />} />
  {ductTypes.map((duct) => (
    <Line 
      key={duct.key}
      type="monotone" 
      dataKey={duct.key} 
      stroke={duct.color} 
      activeDot={{ r: 8 }} 
      strokeWidth={2}
      dot={<CustomDot />}
    />
  ))}
</LineChart>
              </ResponsiveContainer>
              <CustomLegend />
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
                    {ductTypes.map(duct => (
                      <th key={duct.key} className="py-3 px-4 border-b text-left">
                        <div className="flex items-center">
                          <svg width="14" height="14" className="mr-2">
                            {renderCustomShape(duct.shape, 7, 7, 5, duct.color)}
                          </svg>
                          {duct.key}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, index) => (
                    <tr key={metric} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b font-medium">{metric} ({metricUnits[metric]})</td>
                      {ductTypes.map(duct => (
                        <td key={duct.key} className="py-3 px-4 border-b">
                          {performanceData[duct.key][metric][angleIndex].toLocaleString()} {metricUnits[metric]}
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
              <h3 className="text-xl font-semibold mb-2">{activeMetric} ({metricUnits[activeMetric]})</h3>
              <p className="text-gray-600 mb-4">
                Selected angle: {bendAngles[angleIndex]}°
              </p>
            </div>
            {ductTypes.map(duct => (
              <div key={duct.key} className="mb-6">
                <h4 className="text-lg font-medium mb-2 flex items-center">
                  <svg width="16" height="16" className="mr-2">
                    {renderCustomShape(duct.shape, 8, 8, 6, duct.color)}
                  </svg>
                  {duct.key}
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {/* {descriptions[duct.key] && descriptions[duct.key][activeMetric] ? (
                    <p>{descriptions[duct.key][activeMetric]}</p>
                  ) : (
                    <p className="text-gray-500 italic">Description not available for this configuration</p>
                  )} */}
                  <div className="mt-4">
                    <p className="font-medium">Performance Value:</p>
                    <p className="text-lg font-bold" style={{ color: duct.color }}>
                      {performanceData[duct.key][activeMetric][angleIndex].toLocaleString()} {metricUnits[activeMetric]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="text-md font-medium mb-2">Note</h4>
              <p className="text-sm text-gray-600">
                The descriptions above provide detailed information about how each duct type performs at the selected metric and angle. Select different metrics using the buttons on the left panel to see corresponding descriptions.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceAnalysis;