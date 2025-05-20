import React from 'react';

const Overview = ({ projectInfo }) => {
  if (!projectInfo) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Overview</h2>
        <p className="text-gray-500">Please submit a repository to view project information.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-indigo-50 p-4 rounded-md">
          <h3 className="font-bold text-indigo-800 mb-2">Project Analysis</h3>
          <p className="text-indigo-700">{projectInfo.message}</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Type:</span>
              <span>{projectInfo.is_spring_boot ? 'Spring Boot' : 'Java Project'}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Bootable:</span>
              <span>{projectInfo.is_bootable ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Maven:</span>
              <span>{projectInfo.has_maven ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Gradle:</span>
              <span>{projectInfo.has_gradle ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md">
          <h3 className="font-bold text-green-800 mb-2">Documentation Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Endpoints:</span>
              <span>{projectInfo.endpoints_count || 0}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Features:</span>
              <span>{projectInfo.features_count || 0}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Entities:</span>
              <span>{projectInfo.entities_count || 0}</span>
            </div>
            <div className="flex justify-between border-b pb-1">
              <span className="font-medium">Controllers:</span>
              <span>{projectInfo.controllers_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview; 