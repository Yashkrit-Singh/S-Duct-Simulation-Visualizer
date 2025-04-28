import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PerformanceAnalysis from './PerformanceAnalysis';

const ImageDisplay = ({ angle, data }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [hoverIndex, setHoverIndex] = useState(null);
  const [hoveredContour, setHoveredContour] = useState(null);
  
  // Color map labels for each contour type
  const colorMapLabels = {
    contour1_values: "Velocity (m/s)",
    contour2_values: "Pressure (Pa)",
    contour3_values: "Wall Y Plus"
  };

  // Add a mapping for units for each performance metric
  const performanceUnits = {
    'Outlet Velocity': 'm/s',
    'Outlet Total Pressure': 'Pa',
    'Centerline Velocity': 'm/s',
    'Velocity Loss': '%',
    'Pressure Loss': '%'
  };

  // Filter items that match the current angle
  const filteredItems = data.s_duct_shapes.slice(0, 4).filter(item => 
    item.bend_angles?.includes(angle)
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'performance', label: 'Performance Data' },
    { id: 'mesh', label: 'Mesh View' },
    { id: 'contours', label: 'Contour Analysis' }
  ];

  // ColorMap Component with values from JSON data
  const ColorMap = ({ contourType, itemType, angleIndex }) => {
    if (!contourType || !itemType || angleIndex === undefined) return null;
    
    // Find the selected item data
    const itemData = data.s_duct_shapes.find(item => item.type === itemType);
    if (!itemData || !itemData.performance || !itemData.performance.contour_values || 
        !itemData.performance.contour_values[angleIndex]) {
      return null;
    }
    
    // Map contour image key to values key
    const valueKey = contourType.replace('_images', '_values');
    const values = itemData.performance.contour_values[angleIndex][valueKey];
    const label = colorMapLabels[valueKey];
    
    if (!values) return null;
    
    return (
      <motion.div 
        className="flex flex-col items-center mr-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-row items-center">
          {/* Color gradient from public directory */}
          <div className="h-64 w-8 relative rounded-md overflow-hidden shadow-md">
            <img 
              src="/colormap-gradient.svg" 
              alt="Color Map" 
              className="h-full w-full object-cover" 
            />
          </div>
          
          {/* Value markers with hyphens - using actual values from JSON */}
          <div className="flex flex-col justify-between h-64 ml-1">
            {values.map((value, idx) => (
              <div key={idx} className="flex items-center">
                <span className="text-gray-400 mr-1">-</span>
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                  {typeof value === 'number' ? value.toFixed(2) : value}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">{label}</p>
      </motion.div>
    );
  };

  return (
    <div className="relative w-full max-w-screen-lg mx-auto p-4 md:p-12">
      <h2 className="text-3xl font-bold text-center mb-8">S-Duct Shapes at {angle}° Bend Angle</h2>
      
      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {filteredItems.map((item, index) => {
          const angleIndex = item.bend_angles.indexOf(angle);
          const hasImage = item.performance?.images?.[angleIndex];
          
          return (
            <motion.div 
              key={index} 
              className="relative overflow-hidden rounded-xl cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)" 
              }}
              onClick={() => setSelectedItem(JSON.parse(JSON.stringify({ ...item, angleIndex })))}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {hasImage && (
                <div className="relative aspect-square">
                  <motion.img 
                    src={item.performance.images[angleIndex]} 
                    alt={item.type} 
                    className="w-full h-full object-contain"
                    animate={{ 
                      scale: hoverIndex === index ? 1.05 : 1,
                      filter: hoverIndex === index ? "brightness(0.7)" : "brightness(1)"
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: hoverIndex === index ? 0.9 : 0.3 }}
                  />
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-6 text-black"
                    initial={{ y: 10, opacity: 0.7 }}
                    animate={{ 
                      y: hoverIndex === index ? 0 : 10,
                      opacity: hoverIndex === index ? 1 : 0.7 
                    }}
                  >
                    <h3 className="text-2xl font-bold mb-2 capitalize">
                      {item.type.replace(/_/g, ' ')}
                    </h3>
                    {hoverIndex === index && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <p className="text-sm mb-3 opacity-80">
                          {item.performance?.['Velocity Loss']?.[angleIndex] && 
                            `Velocity Loss: ${item.performance['Velocity Loss'][angleIndex]}${performanceUnits['Velocity Loss']}`
                          }
                        </p>
                        <motion.button 
                          className="px-4 py-2 bg-white text-black rounded-full text-sm font-semibold"
                          whileHover={{ scale: 1.05, backgroundColor: "#f0f0f0" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Details
                        </motion.button>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* No results message */}
      {filteredItems.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500">No S-duct shapes available for {angle}° bend angle.</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">
                  {selectedItem.type.replace(/_/g, ' ')}
                </h2>
                <motion.button 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedItem(null)}
                >
                  ✖
                </motion.button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`px-4 py-3 font-medium text-sm relative ${
                      activeTab === tab.id 
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                        layoutId="activeTab"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={selectedItem.performance.images[selectedItem.angleIndex]} 
                        alt={selectedItem.type} 
                        className="w-full h-80 object-cover" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bend Angle</p>
                        <p className="text-xl text-white font-bold">{selectedItem.bend_angles[selectedItem.angleIndex]}°</p>
                      </div>
                      
                      {selectedItem.performance?.['Velocity Loss']?.[selectedItem.angleIndex] && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Velocity Loss</p>
                          <p className="text-xl text-white font-bold">
                            {selectedItem.performance['Velocity Loss'][selectedItem.angleIndex]}{performanceUnits['Velocity Loss']}
                          </p>
                        </div>
                      )}
                      
                      {selectedItem.performance?.['Pressure Loss']?.[selectedItem.angleIndex] && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pressure Loss</p>
                          <p className="text-xl text-white font-bold">
                            {selectedItem.performance['Pressure Loss'][selectedItem.angleIndex]}{performanceUnits['Pressure Loss']}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Performance Data Tab */}
                {activeTab === 'performance' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {['Outlet Velocity', 'Outlet Total Pressure', 'Centerline Velocity', 'Velocity Loss', 'Pressure Loss'].map((key, i) => (
                        selectedItem.performance?.[key]?.[selectedItem.angleIndex] && (
                          <motion.div 
                            key={i} 
                            className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">{key} ({performanceUnits[key]})</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {selectedItem.performance[key][selectedItem.angleIndex]} {performanceUnits[key]}
                            </p>
                          </motion.div>
                        )
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Mesh View Tab */}
                {activeTab === 'mesh' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {selectedItem.performance?.mesh_images?.[selectedItem.angleIndex] ? (
                      <div className="space-y-4">
                        <img 
                          src={selectedItem.performance.mesh_images[selectedItem.angleIndex]} 
                          alt="Mesh" 
                          className="w-full h-auto rounded-xl shadow-lg" 
                        />
                        <p className="text-gray-600 dark:text-gray-300 mt-4">
                          Detailed mesh visualization for {selectedItem.type.replace(/_/g, ' ')} at {selectedItem.bend_angles[selectedItem.angleIndex]}° bend angle.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        No mesh image available for this configuration.
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Contour Analysis Tab */}
                {activeTab === 'contours' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Color map and contour images side by side */}
                    <div className="flex flex-row">
                      {/* Dynamic Color Map - Using selected item's values */}
                      <ColorMap 
                        contourType={hoveredContour} 
                        itemType={selectedItem.type}
                        angleIndex={selectedItem.angleIndex}
                      />
                      
                      {/* Contour Grid */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['contour1_images', 'contour2_images', 'contour3_images'].map((contourKey, i) => {
                          // Map to the corresponding values key
                          const valueKey = contourKey.replace('_images', '_values');
                          
                          return selectedItem.performance?.[contourKey]?.[selectedItem.angleIndex] ? (
                            <motion.div 
                              key={i}
                              className="overflow-hidden rounded-xl shadow-lg"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              whileHover={{ scale: 1.03 }}
                              onMouseEnter={() => setHoveredContour(contourKey)}
                              onMouseLeave={() => setHoveredContour(null)}
                            >
                              <img 
                                src={selectedItem.performance[contourKey][selectedItem.angleIndex]} 
                                alt={`Contour ${i + 1}`} 
                                className="w-full h-48 object-cover" 
                              />
                              <div className="p-3 bg-gray-50 dark:bg-gray-800">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {colorMapLabels[valueKey]}
                                </p>
                              </div>
                            </motion.div>
                          ) : null
                        })}
                      </div>
                    </div>

                    {!selectedItem.performance?.contour1_images?.[selectedItem.angleIndex] && (
                      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        No contour images available for this configuration.
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Analysis Component */}
      <div className="mt-16">
        <PerformanceAnalysis angle={angle} s_duct_shapes={data.s_duct_shapes}/>
      </div>
    </div>
  );
};

export default ImageDisplay;