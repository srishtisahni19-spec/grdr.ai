import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const WarehouseGradingApp = () => {
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [parameters, setParameters] = useState([]);
  const [gradeAnalysis, setGradeAnalysis] = useState({ grade: 0, adjustedParams: [], insights: [] });
  const [properties, setProperties] = useState([]);
  
  // Property details state
  const [propertyDetails, setPropertyDetails] = useState({
    name: '',
    address: '',
    warehouseSize: '',
    plotArea: '',
    constructionType: '',
    eavesHeight: '',
    numberOfDocks: '',
    lmvCirculation: '',
    hmvCirculation: '',
    parkingSpaces: ''
  });
  
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Business type templates with more specific AI-suggested criteria
  const businessTypes = {
    'Food & Beverage': {
      parameters: [
        { name: 'Cold Chain Infrastructure', aiWeight: 30, userWeight: 30, score: 7, maxScore: 10, description: 'Multi-zone refrigeration, blast freezing capability' },
        { name: 'FSSAI & Regulatory Compliance', aiWeight: 25, userWeight: 25, score: 8, maxScore: 10, description: 'Food safety licenses, audit readiness' },
        { name: 'Hygiene & Contamination Control', aiWeight: 20, userWeight: 20, score: 7, maxScore: 10, description: 'Separate raw/cooked zones, pest barriers' },
        { name: 'Transportation Connectivity', aiWeight: 15, userWeight: 15, score: 6, maxScore: 10, description: 'Highway access, cold chain vehicle docks' },
        { name: 'Power Backup & Reliability', aiWeight: 10, userWeight: 10, score: 8, maxScore: 10, description: 'Uninterrupted power for refrigeration' }
      ]
    },
    'E-commerce/General Storage': {
      parameters: [
        { name: 'Fulfillment Efficiency', aiWeight: 25, userWeight: 25, score: 8, maxScore: 10, description: 'Pick-pack zones, sortation capability' },
        { name: 'Last-Mile Connectivity', aiWeight: 25, userWeight: 25, score: 7, maxScore: 10, description: 'Distance to delivery hubs, traffic access' },
        { name: 'Automation Readiness', aiWeight: 20, userWeight: 20, score: 5, maxScore: 10, description: 'Conveyor compatibility, WMS integration' },
        { name: 'Scalability Infrastructure', aiWeight: 15, userWeight: 15, score: 7, maxScore: 10, description: 'Modular racking, expansion potential' },
        { name: 'Security & Theft Prevention', aiWeight: 15, userWeight: 15, score: 6, maxScore: 10, description: 'CCTV coverage, access control systems' }
      ]
    },
    'Automotive Parts': {
      parameters: [
        { name: 'Heavy Equipment Load Capacity', aiWeight: 30, userWeight: 30, score: 9, maxScore: 10, description: 'Floor load rating >500 kg/sqm, crane compatibility' },
        { name: 'Parts Classification Systems', aiWeight: 25, userWeight: 25, score: 6, maxScore: 10, description: 'Small parts racking, heavy component storage' },
        { name: 'Hazmat Storage Compliance', aiWeight: 20, userWeight: 20, score: 8, maxScore: 10, description: 'Oil/fluid containment, battery storage areas' },
        { name: 'Manufacturing Proximity', aiWeight: 15, userWeight: 15, score: 8, maxScore: 10, description: 'Distance to auto plants, supplier networks' },
        { name: 'Quality Control Environment', aiWeight: 10, userWeight: 10, score: 7, maxScore: 10, description: 'Dust control, testing areas' }
      ]
    },
    'Pharmaceuticals': {
      parameters: [
        { name: 'GMP & Regulatory Compliance', aiWeight: 35, userWeight: 35, score: 9, maxScore: 10, description: 'FDA/WHO-GMP certification readiness' },
        { name: 'Environmental Validation', aiWeight: 30, userWeight: 30, score: 8, maxScore: 10, description: 'Temperature mapping, humidity control' },
        { name: 'Controlled Substance Security', aiWeight: 20, userWeight: 20, score: 8, maxScore: 10, description: 'DEA-compliant storage, access logs' },
        { name: 'Serialization & Track-Trace', aiWeight: 10, userWeight: 10, score: 6, maxScore: 10, description: 'Barcode/RFID infrastructure' },
        { name: 'Contamination Prevention', aiWeight: 5, userWeight: 5, score: 7, maxScore: 10, description: 'Cleanroom standards, air filtration' }
      ]
    }
  };

  // Simulate Google Maps Places API (in real app, this would be actual API)
  const simulateAddressSearch = (query) => {
    const mockAddresses = [
      'Industrial Estate, Bhiwandi, Maharashtra 421302',
      'Logistics Park, Aurangabad, Maharashtra 431001', 
      'Warehouse Complex, Nagpur, Maharashtra 440001',
      'Industrial Zone, Pune, Maharashtra 411019',
      'Storage Facility, Mumbai, Maharashtra 400001'
    ];
    
    return mockAddresses.filter(addr => 
      addr.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Handle address input changes
  const handleAddressChange = (value) => {
    setPropertyDetails({...propertyDetails, address: value});
    
    if (value.length > 2) {
      const suggestions = simulateAddressSearch(value);
      setAddressSuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Select address from suggestions
  const selectAddress = (address) => {
    setPropertyDetails({...propertyDetails, address});
    setShowSuggestions(false);
  };

  // Smart grading logic that integrates physical specifications
  const calculateSmartGrade = (params, details) => {
    let adjustedParams = [...params];
    
    // Physical specifications analysis
    const warehouseSize = parseFloat(details.warehouseSize) || 0;
    const plotArea = parseFloat(details.plotArea) || 0;
    const eavesHeight = parseFloat(details.eavesHeight) || 0;
    const numberOfDocks = parseInt(details.numberOfDocks) || 0;
    const lmvArea = parseFloat(details.lmvCirculation) || 0;
    const hmvArea = parseFloat(details.hmvCirculation) || 0;
    
    // Calculate efficiency ratios
    const dockDensity = warehouseSize > 0 ? numberOfDocks / (warehouseSize / 10000) : 0; // docks per 10k sqft
    const circulationRatio = warehouseSize > 0 ? (lmvArea + hmvArea) / warehouseSize : 0;
    const plotUtilization = plotArea > 0 ? warehouseSize / plotArea : 0;
    
    // Apply smart adjustments based on physical specs
    adjustedParams = adjustedParams.map(param => {
      let adjustedScore = param.score;
      let reasoning = [];
      
      // Height-based adjustments
      if (param.name.includes('Storage') || param.name.includes('Capacity') || param.name.includes('Scalability')) {
        if (eavesHeight >= 32) {
          adjustedScore = Math.min(10, adjustedScore + 1.5);
          reasoning.push('High ceiling height (+32ft) enhances storage capacity');
        } else if (eavesHeight >= 24) {
          adjustedScore = Math.min(10, adjustedScore + 0.5);
          reasoning.push('Good ceiling height (24-32ft) supports operations');
        } else if (eavesHeight > 0 && eavesHeight < 20) {
          adjustedScore = Math.max(1, adjustedScore - 1);
          reasoning.push('Low ceiling height (<20ft) limits storage efficiency');
        }
      }
      
      // Dock efficiency adjustments
      if (param.name.includes('Loading') || param.name.includes('Fulfillment') || param.name.includes('Infrastructure')) {
        if (dockDensity >= 3) {
          adjustedScore = Math.min(10, adjustedScore + 1);
          reasoning.push('Excellent dock density (3+ per 10k sqft)');
        } else if (dockDensity >= 1.5) {
          adjustedScore = Math.min(10, adjustedScore + 0.5);
          reasoning.push('Good dock-to-area ratio');
        } else if (dockDensity < 1 && numberOfDocks > 0) {
          adjustedScore = Math.max(1, adjustedScore - 0.5);
          reasoning.push('Low dock density may limit throughput');
        }
      }
      
      // Construction type adjustments
      if (param.name.includes('Compliance') || param.name.includes('Quality') || param.name.includes('Load')) {
        if (details.constructionType === 'RCC') {
          adjustedScore = Math.min(10, adjustedScore + 0.5);
          reasoning.push('RCC construction ensures structural integrity');
        } else if (details.constructionType === 'PEB+RCC') {
          adjustedScore = Math.min(10, adjustedScore + 0.3);
          reasoning.push('Hybrid construction balances cost and durability');
        }
      }
      
      // Circulation efficiency adjustments
      if (param.name.includes('Efficiency') || param.name.includes('Circulation') || param.name.includes('Access')) {
        if (circulationRatio >= 0.15 && circulationRatio <= 0.25) {
          adjustedScore = Math.min(10, adjustedScore + 0.5);
          reasoning.push('Optimal circulation space (15-25% of total)');
        } else if (circulationRatio > 0.25) {
          adjustedScore = Math.max(1, adjustedScore - 0.3);
          reasoning.push('Excessive circulation space reduces storage efficiency');
        }
      }
      
      return {
        ...param,
        score: Math.round(adjustedScore * 10) / 10,
        adjustmentReasons: reasoning
      };
    });
    
    const totalWeight = adjustedParams.reduce((sum, param) => sum + param.userWeight, 0);
    if (totalWeight === 0) return { grade: 0, adjustedParams, insights: [] };
    
    const weightedScore = adjustedParams.reduce((sum, param) => {
      return sum + (param.score / param.maxScore) * param.userWeight;
    }, 0);
    
    const grade = Math.round((weightedScore / totalWeight) * 100);
    
    // Generate insights
    const insights = generateInsights(adjustedParams, details, grade);
    
    return { grade, adjustedParams, insights };
  };
  
  // Generate contextual insights for the report
  const generateInsights = (params, details, grade) => {
    const insights = [];
    
    // Grade-based insights
    if (grade >= 85) {
      insights.push({ type: 'positive', text: 'Exceptional property with strong investment potential across all criteria' });
    } else if (grade >= 75) {
      insights.push({ type: 'positive', text: 'Strong performer with minor areas for optimization' });
    } else if (grade >= 60) {
      insights.push({ type: 'warning', text: 'Adequate property with several improvement opportunities' });
    } else {
      insights.push({ type: 'negative', text: 'Below-average property requiring significant improvements' });
    }
    
    // Physical specs insights
    const warehouseSize = parseFloat(details.warehouseSize) || 0;
    const eavesHeight = parseFloat(details.eavesHeight) || 0;
    const numberOfDocks = parseInt(details.numberOfDocks) || 0;
    
    if (eavesHeight >= 32) {
      insights.push({ type: 'positive', text: 'Excellent ceiling height enables high-density storage and automation' });
    }
    
    if (warehouseSize > 0 && numberOfDocks > 0) {
      const dockDensity = numberOfDocks / (warehouseSize / 10000);
      if (dockDensity < 1) {
        insights.push({ type: 'warning', text: 'Low dock density may create bottlenecks during peak operations' });
      }
    }
    
    if (details.constructionType === 'RCC') {
      insights.push({ type: 'positive', text: 'RCC construction provides superior durability and regulatory compliance' });
    }
    
    // Parameter-specific insights
    const lowScoringParams = params.filter(p => p.score < 6);
    if (lowScoringParams.length > 0) {
      insights.push({ 
        type: 'warning', 
        text: `Key improvement areas: ${lowScoringParams.map(p => p.name).join(', ')}` 
      });
    }
    
    return insights;
  };

  // Update parameters when business type changes
  useEffect(() => {
    if (selectedBusinessType && businessTypes[selectedBusinessType]) {
      setParameters(businessTypes[selectedBusinessType].parameters);
    }
  }, [selectedBusinessType]);

  // Recalculate grade when parameters or property details change
  useEffect(() => {
    if (parameters.length > 0) {
      const analysis = calculateSmartGrade(parameters, propertyDetails);
      setGradeAnalysis(analysis);
      setParameters(analysis.adjustedParams);
    }
  }, [parameters.map(p => p.userWeight + p.score).join(','), JSON.stringify(propertyDetails)]);

  // Update parameter score
  const updateScore = (index, newScore) => {
    const updated = [...parameters];
    updated[index].score = parseInt(newScore);
    setParameters(updated);
  };

  // Update parameter weight
  const updateWeight = (index, newWeight) => {
    const updated = [...parameters];
    updated[index].userWeight = parseInt(newWeight);
    setParameters(updated);
  };

  // Add property to list
  const addProperty = () => {
    if (propertyDetails.name && propertyDetails.address && selectedBusinessType && parameters.length > 0) {
      const newProperty = {
        id: Date.now(),
        details: {...propertyDetails},
        businessType: selectedBusinessType,
        grade: gradeAnalysis.grade,
        parameters: [...gradeAnalysis.adjustedParams],
        insights: [...gradeAnalysis.insights]
      };
      setProperties([...properties, newProperty]);
      
      // Reset form
      setPropertyDetails({
        name: '',
        address: '',
        warehouseSize: '',
        plotArea: '',
        constructionType: '',
        eavesHeight: '',
        numberOfDocks: '',
        lmvCirculation: '',
        hmvCirculation: '',
        parkingSpaces: ''
      });
      setSelectedBusinessType('');
      setParameters([]);
      setGradeAnalysis({ grade: 0, adjustedParams: [], insights: [] });
    }
  };

  // Get grade color
  const getGradeColor = (grade) => {
    if (grade >= 80) return '#10B981';
    if (grade >= 60) return '#F59E0B';
    return '#EF4444';
  };

  // Prepare chart data
  const chartData = parameters.map(param => ({
    name: param.name.length > 15 ? param.name.substring(0, 15) + '...' : param.name,
    'AI Weight': param.aiWeight,
    'Your Weight': param.userWeight,
    'Score': (param.score / param.maxScore) * 100
  }));

  const gradeDistribution = [
    { name: 'Current Score', value: gradeAnalysis.grade, color: getGradeColor(gradeAnalysis.grade) },
    { name: 'Remaining', value: 100 - gradeAnalysis.grade, color: '#E5E7EB' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Warehouse Intelligence Platform</h1>
          <p className="text-gray-600 text-lg">AI-Powered Property Grading & Analysis</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Property Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Name</label>
                  <input
                    type="text"
                    value={propertyDetails.name}
                    onChange={(e) => setPropertyDetails({...propertyDetails, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter property name"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address/Location</label>
                  <input
                    type="text"
                    value={propertyDetails.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Start typing address..."
                  />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {addressSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => selectAddress(suggestion)}
                        >
                          📍 {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warehouse Size</label>
                    <input
                      type="text"
                      value={propertyDetails.warehouseSize}
                      onChange={(e) => setPropertyDetails({...propertyDetails, warehouseSize: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="sq ft"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plot Area</label>
                    <input
                      type="text"
                      value={propertyDetails.plotArea}
                      onChange={(e) => setPropertyDetails({...propertyDetails, plotArea: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="sq ft"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Construction Type</label>
                  <select
                    value={propertyDetails.constructionType}
                    onChange={(e) => setPropertyDetails({...propertyDetails, constructionType: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select type</option>
                    <option value="PEB">PEB (Pre-Engineered Building)</option>
                    <option value="RCC">RCC (Reinforced Cement Concrete)</option>
                    <option value="PEB+RCC">PEB + RCC Hybrid</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Eaves Height</label>
                    <input
                      type="text"
                      value={propertyDetails.eavesHeight}
                      onChange={(e) => setPropertyDetails({...propertyDetails, eavesHeight: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="ft"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Docks</label>
                    <input
                      type="number"
                      value={propertyDetails.numberOfDocks}
                      onChange={(e) => setPropertyDetails({...propertyDetails, numberOfDocks: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LMV Circulation</label>
                    <input
                      type="text"
                      value={propertyDetails.lmvCirculation}
                      onChange={(e) => setPropertyDetails({...propertyDetails, lmvCirculation: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="sq ft"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">HMV Circulation</label>
                    <input
                      type="text"
                      value={propertyDetails.hmvCirculation}
                      onChange={(e) => setPropertyDetails({...propertyDetails, hmvCirculation: e.target.value})}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="sq ft"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parking Spaces</label>
                  <input
                    type="number"
                    value={propertyDetails.parkingSpaces}
                    onChange={(e) => setPropertyDetails({...propertyDetails, parkingSpaces: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Number of spaces"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                  <select
                    value={selectedBusinessType}
                    onChange={(e) => setSelectedBusinessType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select business type</option>
                    {Object.keys(businessTypes).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Grade Display */}
                {parameters.length > 0 && (
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold" style={{ color: getGradeColor(gradeAnalysis.grade) }}>
                      {gradeAnalysis.grade}%
                    </div>
                    <div className="text-xs text-gray-500">Overall Grade</div>
                  </div>
                )}

                <button
                  onClick={addProperty}
                  disabled={!propertyDetails.name || !propertyDetails.address || !selectedBusinessType}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Save Property
                </button>
              </div>
            </div>
          </div>

          {/* Parameters Panel */}
          <div className="lg:col-span-2">
            {parameters.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">AI Evaluation Criteria</h2>
                
                <div className="space-y-3">
                  {parameters.map((param, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{param.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {param.score}/{param.maxScore}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Score {param.adjustmentReasons && param.adjustmentReasons.length > 0 && '🤖'}
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="1"
                              max={param.maxScore}
                              value={param.score}
                              onChange={(e) => updateScore(index, e.target.value)}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium w-8">{param.score}</span>
                          </div>
                          {param.adjustmentReasons && param.adjustmentReasons.length > 0 && (
                            <div className="mt-1">
                              {param.adjustmentReasons.map((reason, idx) => (
                                <div key={idx} className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">
                                  {reason}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Weight (AI: {param.aiWeight}%)
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={param.userWeight}
                              onChange={(e) => updateWeight(index, e.target.value)}
                              className="flex-1"
                            />
                            <span className="text-sm font-medium w-8">{param.userWeight}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Report */}
        {gradeAnalysis.grade > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Investment Analysis Report</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Executive Summary */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
                <div className="space-y-3">
                  {gradeAnalysis.insights.map((insight, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg text-sm ${
                        insight.type === 'positive' ? 'bg-green-50 text-green-800 border-l-4 border-green-400' :
                        insight.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400' :
                        'bg-red-50 text-red-800 border-l-4 border-red-400'
                      }`}
                    >
                      {insight.text}
                    </div>
                  ))}
                </div>
                
                {/* Property Specifications Summary */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Property Specifications</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      {propertyDetails.warehouseSize && <div><span className="text-gray-600">Size:</span> {propertyDetails.warehouseSize} sq ft</div>}
                      {propertyDetails.plotArea && <div><span className="text-gray-600">Plot:</span> {propertyDetails.plotArea} sq ft</div>}
                      {propertyDetails.constructionType && <div><span className="text-gray-600">Construction:</span> {propertyDetails.constructionType}</div>}
                      {propertyDetails.eavesHeight && <div><span className="text-gray-600">Height:</span> {propertyDetails.eavesHeight} ft</div>}
                    </div>
                    <div className="space-y-1">
                      {propertyDetails.numberOfDocks && <div><span className="text-gray-600">Docks:</span> {propertyDetails.numberOfDocks}</div>}
                      {propertyDetails.lmvCirculation && <div><span className="text-gray-600">LMV Area:</span> {propertyDetails.lmvCirculation} sq ft</div>}
                      {propertyDetails.hmvCirculation && <div><span className="text-gray-600">HMV Area:</span> {propertyDetails.hmvCirculation} sq ft</div>}
                      {propertyDetails.parkingSpaces && <div><span className="text-gray-600">Parking:</span> {propertyDetails.parkingSpaces} spaces</div>}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Key Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Metrics</h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-2xl font-bold" style={{ color: getGradeColor(gradeAnalysis.grade) }}>
                      {gradeAnalysis.grade}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Grade</div>
                  </div>
                  
                  {propertyDetails.warehouseSize && propertyDetails.numberOfDocks && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        {(parseInt(propertyDetails.numberOfDocks) / (parseFloat(propertyDetails.warehouseSize) / 10000)).toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">Docks per 10K sq ft</div>
                    </div>
                  )}
                  
                  {propertyDetails.warehouseSize && propertyDetails.plotArea && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        {((parseFloat(propertyDetails.warehouseSize) / parseFloat(propertyDetails.plotArea)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Plot Utilization</div>
                    </div>
                  )}
                  
                  {propertyDetails.lmvCirculation && propertyDetails.hmvCirculation && propertyDetails.warehouseSize && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">
                        {(((parseFloat(propertyDetails.lmvCirculation) + parseFloat(propertyDetails.hmvCirculation)) / parseFloat(propertyDetails.warehouseSize)) * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Circulation Ratio</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {parameters.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Weight Comparison: AI vs Your Adjustments</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="AI Weight" fill="#3B82F6" name="AI Suggested Weight" />
                  <Bar dataKey="Your Weight" fill="#10B981" name="Your Weight" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Grade Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <div className="text-2xl font-bold" style={{ color: getGradeColor(gradeAnalysis.grade) }}>
                  {gradeAnalysis.grade}% Grade
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Properties List */}
        {properties.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Evaluated Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {properties.map(property => (
                <div key={property.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{property.details.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">{property.details.address}</p>
                  <p className="text-xs text-gray-600 mb-2">{property.businessType}</p>
                  
                  {/* Property Specs */}
                  <div className="text-xs text-gray-500 mb-3 space-y-1">
                    {property.details.warehouseSize && <div>Size: {property.details.warehouseSize} sq ft</div>}
                    {property.details.constructionType && <div>Type: {property.details.constructionType}</div>}
                    {property.details.numberOfDocks && <div>Docks: {property.details.numberOfDocks}</div>}
                  </div>
                  
                  {/* Enhanced Property Display with Insights */}
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold" style={{ color: getGradeColor(property.grade) }}>
                      {property.grade}%
                    </div>
                    <div className="text-xs text-gray-500">Investment Grade</div>
                  </div>
                  
                  {/* Key Insights */}
                  {property.insights && property.insights.length > 0 && (
                    <div className="mb-3">
                      {property.insights.slice(0, 2).map((insight, idx) => (
                        <div 
                          key={idx} 
                          className={`text-xs p-2 rounded mb-1 ${
                            insight.type === 'positive' ? 'bg-green-50 text-green-700' :
                            insight.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                          }`}
                        >
                          {insight.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {parameters.length === 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use This System</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-2">
              <li>Enter property details including physical specifications</li>
              <li>Select your business type for AI-generated evaluation criteria</li>
              <li>Adjust scores (1-10) for each parameter based on property assessment</li>
              <li>Modify weights to reflect your business priorities</li>
              <li>View real-time grade calculations and analytics</li>
              <li>Save properties to build your evaluation database</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseGradingApp;