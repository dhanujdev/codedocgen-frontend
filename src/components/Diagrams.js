import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const Diagrams = ({ repoName }) => {
  const [selectedDiagramType, setSelectedDiagramType] = useState('class');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagramData, setDiagramData] = useState(null);

  const diagramTypes = [
    { id: 'class', name: 'Class Diagram', available: true },
    { id: 'er', name: 'ER Diagram', available: true },
    { id: 'use-case', name: 'Use-Case Diagram', available: true },
    { id: 'interaction', name: 'Interaction Diagram', available: true }
  ];

  useEffect(() => {
    if (repoName && diagramTypes.find(d => d.id === selectedDiagramType)?.available) {
      fetchDiagram();
    }
  }, [repoName, selectedDiagramType]);

  const fetchDiagram = async () => {
    if (!repoName) return;

    setIsLoading(true);
    setError('');
    setDiagramData(null);

    try {
      let endpoint = '';
      
      // Use different endpoint based on diagram type
      if (selectedDiagramType === 'class' || selectedDiagramType === 'er') {
        endpoint = `${API_BASE_URL}/api/repo/diagrams/entities/${repoName}?diagram_type=${selectedDiagramType}`;
      } else if (selectedDiagramType === 'use-case') {
        endpoint = `${API_BASE_URL}/api/repo/diagrams/use-cases/${repoName}`;
      } else if (selectedDiagramType === 'interaction') {
        endpoint = `${API_BASE_URL}/api/repo/diagrams/interaction/${repoName}`;
      }
      
      const response = await axios.get(endpoint);

      if (response.data.status === 'success') {
        setDiagramData(response.data);
      } else {
        setError(response.data.message || 'Failed to generate diagram');
      }
    } catch (err) {
      console.error('Error fetching diagram:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate diagram');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Diagrams</h2>
      
      {!repoName ? (
        <p className="text-gray-500">Please submit a repository to view diagrams.</p>
      ) : (
        <div>
          <div className="mb-6">
            <label htmlFor="diagram-type" className="block text-sm font-medium text-gray-700 mb-1">
              Diagram Type
            </label>
            <select
              id="diagram-type"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedDiagramType}
              onChange={(e) => setSelectedDiagramType(e.target.value)}
            >
              {diagramTypes.map((type) => (
                <option key={type.id} value={type.id} disabled={!type.available}>
                  {type.name} {!type.available && '(Coming Soon)'}
                </option>
              ))}
            </select>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="spinner inline-block w-8 h-8 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-600">Generating diagram...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              <p>{error}</p>
            </div>
          ) : !diagramData ? (
            <div className="text-center py-12 bg-gray-50 rounded-md">
              <div className="mx-auto max-w-lg">
                <h3 className="text-lg font-medium text-gray-900">Select a diagram type</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Choose from the available diagram types above.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Diagram Preview</h3>
                {diagramData.diagram_url ? (
                  <div className="flex justify-center">
                    <img 
                      src={diagramData.diagram_url} 
                      alt={`${selectedDiagramType} Diagram`} 
                      className="border border-gray-300 max-w-full"
                    />
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-100 border border-gray-300 rounded">
                    <p className="text-gray-500">Unable to render diagram. PlantUML source code is available below.</p>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">PlantUML Source</h3>
                <pre className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto text-xs">
                  {diagramData.puml_source}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Diagrams; 