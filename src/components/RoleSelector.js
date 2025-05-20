import React from 'react';

const RoleSelector = ({ currentRole, onChange }) => {
  const roles = [
    { id: 'developer', label: 'Developer', description: 'Full API specs, flow traces' },
    { id: 'architect', label: 'Architect', description: 'Diagrams, dependency flows, component maps' },
    { id: 'product_owner', label: 'Product Owner', description: 'Summaries, features' },
    { id: 'qa', label: 'QA', description: 'Endpoint usage, test cases' },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <h3 className="text-lg font-semibold mr-2">View As:</h3>
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onChange(role.id)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                currentRole === role.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-600">
        {currentRole && roles.find(r => r.id === currentRole)?.description}
      </p>
    </div>
  );
};

export default RoleSelector; 