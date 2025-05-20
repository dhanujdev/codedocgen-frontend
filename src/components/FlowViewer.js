import React, { useState, useEffect } from 'react';
import { getFlows } from '../services/api';

const FlowViewer = ({ repoName }) => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFlows, setExpandedFlows] = useState({});

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoading(true);
        const response = await getFlows(repoName);
        if (response.status === 'success') {
          setFlows(response.flows || []);
        } else {
          setError(response.message || 'Failed to load flow data');
        }
      } catch (err) {
        setError('Error loading endpoint flow data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (repoName) {
      fetchFlows();
    }
  }, [repoName]);

  const toggleExpandFlow = (index) => {
    setExpandedFlows((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleExpandAll = () => {
    if (Object.values(expandedFlows).some(value => value)) {
      // If any are expanded, collapse all
      setExpandedFlows({});
    } else {
      // Expand all
      const allExpanded = {};
      flows.forEach((_, index) => {
        allExpanded[index] = true;
      });
      setExpandedFlows(allExpanded);
    }
  };

  const renderMethodParams = (params) => {
    if (!params || params.length === 0) return '()';
    return `(${params.map(p => `${p.type} ${p.name}`).join(', ')})`;
  };

  const renderCallTree = (calls, depth = 0) => {
    if (!calls || calls.length === 0) return null;
    
    return (
      <ul className="pl-5 mt-1 border-l-2 border-gray-300">
        {calls.map((call, idx) => (
          <li key={idx} className="mt-2">
            <div className="flex items-start">
              <span className="mr-2 text-gray-400">→</span>
              <div>
                <span className={`font-mono ${getClassTypeColor(call.class_type)}`}>
                  {call.class_name}
                </span>
                <span className="text-gray-700">.{call.method}</span>
                {call.parameters && (
                  <span className="text-gray-600 text-sm">
                    {renderMethodParams(call.parameters)}
                  </span>
                )}
                {call.return_type && (
                  <span className="ml-2 text-gray-500 italic text-xs">
                    returns {call.return_type}
                  </span>
                )}
                {renderCallTree(call.calls, depth + 1)}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const getClassTypeColor = (classType) => {
    switch (classType) {
      case 'controller':
        return 'text-blue-700';
      case 'service':
        return 'text-green-600';
      case 'repository':
        return 'text-orange-600';
      default:
        return 'text-gray-700';
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading endpoint flows...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (flows.length === 0) {
    return <div className="p-4 text-center text-gray-500">No endpoint flows available</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Endpoint Flow Traces</h2>
        <button 
          onClick={toggleExpandAll}
          className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
        >
          {Object.values(expandedFlows).some(value => value) ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      
      <div className="space-y-4">
        {flows.map((flow, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <div 
              className="flex justify-between items-center p-3 bg-gray-100 cursor-pointer"
              onClick={() => toggleExpandFlow(index)}
            >
              <div className="flex items-center">
                <span className={`px-2 py-0.5 rounded text-xs font-bold mr-2 ${
                  flow.http_method === 'GET' ? 'bg-green-100 text-green-800' :
                  flow.http_method === 'POST' ? 'bg-blue-100 text-blue-800' :
                  flow.http_method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                  flow.http_method === 'DELETE' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {flow.http_method}
                </span>
                <span className="font-mono font-medium">{flow.endpoint}</span>
              </div>
              <div className="text-gray-500">
                {expandedFlows[index] ? (
                  <span>▼</span>
                ) : (
                  <span>▶</span>
                )}
              </div>
            </div>
            
            {expandedFlows[index] && (
              <div className="p-3 bg-white">
                <div className="mb-2">
                  <span className="text-sm font-semibold">Controller: </span>
                  <span className="font-mono text-blue-700">{flow.controller}</span>
                </div>
                
                <div className="border-t pt-2">
                  <h4 className="text-sm font-semibold mb-2">Call Flow:</h4>
                  <div className="pl-2">
                    {flow.flow.map((entry, idx) => (
                      <div key={idx} className="mb-3">
                        <div className="flex items-start">
                          <span className={`font-mono ${getClassTypeColor(entry.class_type)}`}>
                            {entry.class_name}
                          </span>
                          <span className="text-gray-700">.{entry.method}</span>
                          {entry.parameters && (
                            <span className="text-gray-600 text-sm">
                              {renderMethodParams(entry.parameters)}
                            </span>
                          )}
                          {entry.return_type && (
                            <span className="ml-2 text-gray-500 italic text-xs">
                              returns {entry.return_type}
                            </span>
                          )}
                        </div>
                        {renderCallTree(entry.calls)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowViewer; 