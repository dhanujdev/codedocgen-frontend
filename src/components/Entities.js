import React, { useState, useEffect } from 'react';
import { getEntities } from '../services/api';

const Entities = ({ repoName }) => {
  const [entities, setEntities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!repoName) return;
    
    const fetchEntities = async () => {
      setLoading(true);
      try {
        const response = await getEntities(repoName);
        setEntities(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching entities:', err);
        setError('Failed to fetch entity data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntities();
  }, [repoName]);

  if (!repoName) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Entity Models</h2>
        <p className="text-gray-500">Please submit a repository to view entity information.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Entity Models</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
        <p className="text-center mt-4 text-gray-500">Loading entity data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Entity Models</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!entities || !entities.entities || Object.keys(entities.entities).length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Entity Models</h2>
        <p className="text-gray-500">No entities found in the repository.</p>
      </div>
    );
  }

  // Always show all details
  const showFieldDetails = true;
  const showAnnotations = true;
  const showRelationships = true;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Entity Models
      </h2>
      
      <div className="space-y-8">
        {Object.entries(entities.entities).map(([entityName, entity]) => (
          <div key={entityName} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 font-semibold">
              {entity.business_name || entityName}
              {entity.business_name && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({entityName})
                </span>
              )}
            </div>
            
            <div className="p-4">
              {entity.fields && entity.fields.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold mb-3">Fields</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Annotations
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {entity.fields.map((field, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {field.name}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 font-mono">
                              {field.type}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {field.annotations && field.annotations.map((anno, i) => (
                                <div key={i} className="text-xs font-mono">{anno}</div>
                              ))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Entities; 