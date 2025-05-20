import React, { useState } from 'react';
// import './App.css'; // We can remove this if Tailwind handles all base styling
import Layout from './components/Layout';
import RepoInputForm from './components/RepoInputForm';
import Overview from './components/Overview';
import Entities from './components/Entities';
import Diagrams from './components/Diagrams';
import Publish from './components/Publish';
import FeatureFilesViewer from './components/FeatureFilesViewer';
import FlowViewer from './components/FlowViewer';
import SchemaExplorer from './components/SchemaExplorer';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [repoName, setRepoName] = useState('');
  const [projectInfo, setProjectInfo] = useState(null);
  const [endpoints, setEndpoints] = useState(null);

  // This function will be passed down to RepoInputForm
  const updateProjectData = (newRepoName, newProjectInfo, newEndpoints) => {
    console.log("Updating project data:", { newRepoName, newProjectInfo, newEndpoints });
    setRepoName(newRepoName);
    setProjectInfo(newProjectInfo);
    setEndpoints(newEndpoints);
  };

  const renderContent = () => {
    // Common header with repo input form
    const header = (
      <>
        <RepoInputForm updateProjectData={updateProjectData} />
      </>
    );

    switch (activeTab) {
      case 'overview':
        return (
          <div>
            {header}
            <div className="mt-6">
              <Overview projectInfo={projectInfo} />
            </div>
          </div>
        );
      case 'endpoints':
        return (
          <div>
            {header}
            <div className="mt-6">
              {endpoints && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">API Endpoints</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Controller
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            HTTP Method
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Path
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200 text-sm">
                        {endpoints.endpoints && endpoints.endpoints.map((endpoint, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {endpoint.controller}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              {endpoint.method}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                endpoint.http_method === 'GET' ? 'bg-green-100 text-green-800' :
                                endpoint.http_method === 'POST' ? 'bg-blue-100 text-blue-800' :
                                endpoint.http_method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                                endpoint.http_method === 'DELETE' ? 'bg-red-100 text-red-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {endpoint.http_method}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono">
                              {endpoint.path}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Flow Viewer for endpoint traces */}
                  {repoName && (
                    <div className="mt-8">
                      <FlowViewer repoName={repoName} />
                    </div>
                  )}
                </div>
              )}
              {!endpoints && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">API Endpoints</h2>
                  <p className="text-gray-500">Please submit a Spring Boot repository to view endpoints.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'features':
        return (
          <div>
            {header}
            <div className="mt-6">
              {repoName ? (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Feature Files</h2>
                  <FeatureFilesViewer repoName={repoName} />
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Feature Files</h2>
                  <p className="text-gray-500">Please submit a repository to view feature files.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'entities':
        return (
          <div>
            {header}
            <div className="mt-6">
              <Entities repoName={repoName} />
              
              {/* Schema Explorer */}
              {repoName && (
                <div className="mt-8">
                  <SchemaExplorer repoName={repoName} />
                </div>
              )}
            </div>
          </div>
        );
      case 'diagrams':
        return (
          <div>
            {header}
            <div className="mt-6">
              <Diagrams repoName={repoName} />
            </div>
          </div>
        );
      case 'publish':
        return (
          <div>
            {header}
            <div className="mt-6">
              <Publish repoName={repoName} />
            </div>
          </div>
        );
      default:
        return <Overview projectInfo={projectInfo} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-indigo-700">
          CodeDocGen Dashboard
        </h1>
        <p className="text-gray-600">
          Interactive Spring Boot Documentation & Testing Companion
        </p>
      </header>
      
      {renderContent()}
      
      <footer className="mt-auto py-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} CodeDocGen. All rights reserved.</p>
      </footer>
    </Layout>
  );
}

export default App; 