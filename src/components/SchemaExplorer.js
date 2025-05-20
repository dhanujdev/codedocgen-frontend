import React, { useState, useEffect } from 'react';
import { getSchemaOverview } from '../services/api';

const SchemaExplorer = ({ repoName }) => {
  const [schemaData, setSchemaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tables');
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    const fetchSchemaData = async () => {
      try {
        setLoading(true);
        const response = await getSchemaOverview(repoName);
        if (response.status === 'success') {
          setSchemaData(response);
          
          // Set the first table as selected by default
          const tableKeys = Object.keys(response.tables || {});
          if (tableKeys.length > 0) {
            setSelectedTable(tableKeys[0]);
          }
        } else {
          setError(response.message || 'Failed to load schema data');
        }
      } catch (err) {
        setError('Error loading schema overview');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (repoName) {
      fetchSchemaData();
    }
  }, [repoName]);

  const renderTablesView = () => {
    if (!schemaData || !schemaData.tables || Object.keys(schemaData.tables).length === 0) {
      return <div className="p-4 text-center text-gray-500">No tables found</div>;
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-3 font-semibold border-b">Tables</div>
          <div className="overflow-auto max-h-96">
            <ul className="divide-y">
              {Object.entries(schemaData.tables).map(([tableName, tableData]) => (
                <li 
                  key={tableName}
                  onClick={() => setSelectedTable(tableName)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${
                    selectedTable === tableName ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-mono">{tableName}</div>
                  {tableData.business_name && (
                    <div className="text-sm text-gray-600">
                      {tableData.business_name}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Entity: {tableData.entity}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 border rounded-lg overflow-hidden">
          {selectedTable ? (
            <div>
              <div className="bg-gray-100 p-3 font-semibold border-b">
                Table Details: <span className="font-mono">{selectedTable}</span>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-sm uppercase text-gray-500 mb-2">Entity:</h3>
                  <div className="font-mono">{schemaData.tables[selectedTable].entity}</div>
                </div>

                {schemaData.tables[selectedTable].relations && 
                 schemaData.tables[selectedTable].relations.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm uppercase text-gray-500 mb-2">Relations:</h3>
                    <ul className="list-disc pl-5">
                      {schemaData.tables[selectedTable].relations.map((relation, idx) => (
                        <li key={idx} className="font-mono">
                          {relation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {schemaData.tables[selectedTable].used_by && 
                 schemaData.tables[selectedTable].used_by.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm uppercase text-gray-500 mb-2">Used By Endpoints:</h3>
                    <ul className="list-disc pl-5">
                      {schemaData.tables[selectedTable].used_by.map((endpoint, idx) => (
                        <li key={idx} className="font-mono">
                          {endpoint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {schemaData.entities && 
                 schemaData.entities[schemaData.tables[selectedTable].entity] && 
                 schemaData.entities[schemaData.tables[selectedTable].entity].fields && (
                  <div>
                    <h3 className="font-semibold text-sm uppercase text-gray-500 mb-2">Fields:</h3>
                    <div className="overflow-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DB Column</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {schemaData.entities[schemaData.tables[selectedTable].entity].fields.map((field, idx) => (
                            <tr key={idx}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium font-mono">{field.name}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 font-mono">{field.type}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 font-mono">
                                {schemaData.entities[schemaData.tables[selectedTable].entity].column_mappings &&
                                 schemaData.entities[schemaData.tables[selectedTable].entity].column_mappings[field.name]}
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
          ) : (
            <div className="p-4 text-center text-gray-500">
              Select a table to view details
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRelationsView = () => {
    if (!schemaData || !schemaData.tables || Object.keys(schemaData.tables).length === 0) {
      return <div className="p-4 text-center text-gray-500">No relations found</div>;
    }

    // Generate a simple mermaid diagram
    const nodes = Object.keys(schemaData.tables).map(tableName => 
      `  ${tableName}[${tableName}]`
    );
    
    const relationships = [];
    Object.entries(schemaData.tables).forEach(([tableName, tableData]) => {
      if (tableData.relations) {
        tableData.relations.forEach(relation => {
          relationships.push(`  ${tableName} --> ${relation}`);
        });
      }
    });
    
    const diagram = `graph TD\n${nodes.join('\n')}\n${relationships.join('\n')}`;
    
    return (
      <div className="border rounded-lg p-4">
        <div className="bg-gray-100 p-3 rounded-lg">
          <pre className="text-xs overflow-auto whitespace-pre-wrap">{diagram}</pre>
          <div className="mt-4 text-sm text-gray-600 bg-yellow-100 p-2 rounded">
            <p><strong>Note:</strong> This is a diagram in Mermaid syntax. For a visual representation:</p>
            <ol className="list-decimal pl-5 mt-2">
              <li>Copy the diagram text above</li>
              <li>Paste it into a Mermaid editor like <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">mermaid.live</a></li>
            </ol>
          </div>
        </div>
      </div>
    );
  };

  const renderEntityDetailsView = () => {
    if (!schemaData || !schemaData.entities || Object.keys(schemaData.entities).length === 0) {
      return <div className="p-4 text-center text-gray-500">No entity details available</div>;
    }

    return (
      <div className="space-y-6">
        {Object.entries(schemaData.entities).map(([entityName, entityData]) => (
          <div key={entityName} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 font-semibold border-b">
              Entity: <span className="font-mono">{entityName}</span>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <span className="text-sm text-gray-600">Package: </span>
                <span className="font-mono">{entityData.package}</span>
              </div>
              
              {entityData.annotations && entityData.annotations.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Annotations:</h4>
                  <div className="bg-gray-50 p-2 rounded">
                    {entityData.annotations.map((anno, idx) => (
                      <div key={idx} className="font-mono text-sm text-gray-700">{anno}</div>
                    ))}
                  </div>
                </div>
              )}
              
              {entityData.fields && entityData.fields.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-600 mb-1">Fields:</h4>
                  <div className="overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annotations</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {entityData.fields.map((field, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium font-mono">{field.name}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 font-mono">{field.type}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">
                              {field.annotations && field.annotations.map((anno, annoIdx) => (
                                <div key={annoIdx} className="font-mono text-xs">{anno}</div>
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
    );
  };

  if (loading) {
    return <div className="p-4 text-center">Loading schema data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!schemaData) {
    return <div className="p-4 text-center text-gray-500">No schema data available</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Database Schema Explorer</h2>
      
      <div className="mb-4">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'tables' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('tables')}
          >
            Tables List
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'relations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('relations')}
          >
            Relations Graph
          </button>
          {/* Only show Entity Details tab if the data is available */}
          {schemaData && schemaData.entities && Object.keys(schemaData.entities).length > 0 && (
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'entity-details' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'
              }`}
              onClick={() => setActiveTab('entity-details')}
            >
              Entity Details
            </button>
          )}
        </div>
      </div>
      
      <div>
        {activeTab === 'tables' && renderTablesView()}
        {activeTab === 'relations' && renderRelationsView()}
        {activeTab === 'entity-details' && renderEntityDetailsView()}
      </div>
    </div>
  );
};

export default SchemaExplorer; 