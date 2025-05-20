import React, { useState } from 'react';
import axios from 'axios';
import SwaggerViewer from './SwaggerViewer';
import FeatureFilesViewer from './FeatureFilesViewer';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function RepoInputForm({ updateProjectData }) {
    const [repoUrl, setRepoUrl] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(''); // Can be empty, 'submitting', 'cloning', 'analyzing'
    const [repoName, setRepoName] = useState('');
    const [cloneStatus, setCloneStatus] = useState('');
    const [projectInfo, setProjectInfo] = useState(null);
    const [endpoints, setEndpoints] = useState(null);
    const [activeTab, setActiveTab] = useState('project'); // 'project', 'endpoints', 'swagger', or 'features'

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');
        setCloneStatus('');
        setRepoName('');
        setProjectInfo(null);
        setEndpoints(null);
        setIsLoading('submitting');
        setActiveTab('project');

        if (!repoUrl) {
            setError('Repository URL is required.');
            setIsLoading('');
            return;
        }

        // Basic URL validation
        try {
            new URL(repoUrl);
        } catch (_) {
            setError('Invalid Repository URL format.');
            setIsLoading('');
            return;
        }

        try {
            // Step 1: First acknowledge the repository details
            const initialResponse = await axios.post(`${API_BASE_URL}/api/repo/submit-repo`, {
                repo_url: repoUrl,
                username: null,
                password: null,
            });

            // Display submission acknowledgment
            setMessage(`Success: ${initialResponse.data.message}`);
            
            // Step 2: Now attempt to clone the repository
            setIsLoading('cloning');
            setCloneStatus('Cloning repository...');
            
            const cloneResponse = await axios.post(`${API_BASE_URL}/api/repo/clone`, {
                repo_url: repoUrl,
                username: null,
                password: null,
            });
            
            // Handle the clone result
            if (cloneResponse.data.status === 'success') {
                setCloneStatus('Repository cloned successfully!');
                setRepoName(cloneResponse.data.repo_name);
                
                // Step 3: Analyze the repository
                setIsLoading('analyzing');
                setCloneStatus(prev => `${prev} Analyzing project type...`);
                
                try {
                    const analyzeResponse = await axios.get(`${API_BASE_URL}/api/repo/analyze/${cloneResponse.data.repo_name}`);
                    
                    if (analyzeResponse.data.status === 'success') {
                        setProjectInfo(analyzeResponse.data);

                        // Pass the initial project data to parent (will be updated with endpoints later if available)
                        updateProjectData(
                            cloneResponse.data.repo_name,
                            analyzeResponse.data,
                            null
                        );
                        
                        // If it's a Spring Boot project, fetch endpoints
                        if (analyzeResponse.data.is_spring_boot) {
                            setCloneStatus(prev => `${prev} Parsing endpoints...`);
                            
                            try {
                                const endpointsResponse = await axios.get(`${API_BASE_URL}/api/repo/endpoints/${cloneResponse.data.repo_name}`);
                                
                                if (endpointsResponse.data.status === 'success') {
                                    setEndpoints(endpointsResponse.data);
                                    
                                    // Enhance the project info with counts
                                    const enhancedProjectInfo = {
                                        ...analyzeResponse.data,
                                        endpoints_count: endpointsResponse.data.endpoints ? endpointsResponse.data.endpoints.length : 0,
                                        features_count: 0,  // Will be updated later if available
                                        entities_count: 0,  // Will be updated later if available
                                        controllers_count: endpointsResponse.data.endpoints ? 
                                            new Set(endpointsResponse.data.endpoints.map(e => e.controller)).size : 0
                                    };
                                    
                                    // Update the parent component with the enhanced data
                                    updateProjectData(
                                        cloneResponse.data.repo_name,
                                        enhancedProjectInfo,
                                        endpointsResponse.data
                                    );
                                } else {
                                    setError(`Error parsing endpoints: ${endpointsResponse.data.message || 'Unknown error'}`);
                                    // Note: We already passed the project data above, so no need to pass it again
                                }
                            } catch (endpointsErr) {
                                console.error("Error fetching endpoints:", endpointsErr);
                                setError(`Error parsing endpoints: ${
                                    endpointsErr.response?.data?.detail || 
                                    endpointsErr.message || 
                                    'Failed to parse endpoints'
                                }`);
                                // Note: We already passed the project data above, so no need to pass it again
                            }
                        }
                        
                        // Reset form fields on success
                        setRepoUrl('');
                    } else {
                        setError(`Error analyzing project: ${analyzeResponse.data.message || 'Unknown error'}`);
                    }
                } catch (analyzeErr) {
                    setError(`Error analyzing project: ${
                        analyzeErr.response?.data?.detail || 
                        analyzeErr.message || 
                        'Failed to analyze project'
                    }`);
                }
            } else {
                setCloneStatus('Failed to clone repository.');
                setError(cloneResponse.data.message);
            }
        } catch (err) {
            if (err.response) {
                setError(`Error: ${err.response.data.detail || 'Failed to process repository.'}`);
            } else if (err.request) {
                setError('Error: No response from server. Is the backend running?');
            } else {
                setError(`Error: ${err.message}`);
            }
            setCloneStatus('Failed to process repository.');
        }
        
        setIsLoading('');
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Submit Repository</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-sm">
                <p className="text-yellow-700 font-medium">Note:</p>
                <p className="text-yellow-700">This form only accepts public Git repositories.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        Public Repository URL <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="repoUrl"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/username/repo.git"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Enter a public Git repository URL (GitHub, Bitbucket, etc.)
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                    {isLoading ? 
                        isLoading === 'submitting' ? 'Submitting...' : 
                        isLoading === 'cloning' ? 'Cloning...' : 
                        isLoading === 'analyzing' ? 'Analyzing...' : 
                        'Processing...' 
                        : 'Submit Repo'}
                </button>
            </form>
            
            {/* Status messages */}
            {message && (
                <p className="mt-4 text-sm text-green-600 bg-green-100 p-3 rounded-md">{message}</p>
            )}
            
            {cloneStatus && (
                <p className={`mt-2 text-sm p-3 rounded-md ${
                    cloneStatus.includes('Failed') 
                        ? 'text-orange-600 bg-orange-100' 
                        : cloneStatus.includes('success') 
                            ? 'text-green-600 bg-green-100'
                            : 'text-blue-600 bg-blue-100'
                }`}>
                    {cloneStatus}
                    {repoName && <span className="block font-semibold mt-1">Repository: {repoName}</span>}
                </p>
            )}
            
            {/* Tab navigation */}
            {(projectInfo || endpoints) && (
                <div className="mt-6 border-b border-gray-200">
                    <nav className="-mb-px flex">
                        <button
                            onClick={() => setActiveTab('project')}
                            className={`py-2 px-4 border-b-2 font-medium text-sm ${
                                activeTab === 'project'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Project Info
                        </button>
                        <button
                            onClick={() => setActiveTab('endpoints')}
                            className={`py-2 px-4 border-b-2 font-medium text-sm ${
                                activeTab === 'endpoints'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Endpoints
                            {endpoints && endpoints.endpoints && endpoints.endpoints.length > 0 && (
                                <span className="ml-2 bg-indigo-100 text-indigo-800 py-0.5 px-2 rounded-full text-xs">
                                    {endpoints.endpoints.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('swagger')}
                            className={`py-2 px-4 border-b-2 font-medium text-sm ${
                                activeTab === 'swagger'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Swagger UI
                        </button>
                        <button
                            onClick={() => setActiveTab('features')}
                            className={`py-2 px-4 border-b-2 font-medium text-sm ${
                                activeTab === 'features'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Features
                        </button>
                    </nav>
                </div>
            )}
            
            {/* Project Information */}
            {activeTab === 'project' && projectInfo && (
                <div className="mt-4 text-sm bg-indigo-50 p-4 rounded-md">
                    <h3 className="font-bold text-indigo-800 mb-2">Project Analysis</h3>
                    <p className="text-indigo-700">{projectInfo.message}</p>
                    <div className="mt-2 space-y-1">
                        <p className="flex justify-between">
                            <span className="font-medium">Type:</span>
                            <span className="font-semibold">{projectInfo.project_type}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-medium">Build System:</span>
                            <span>{projectInfo.build_system}</span>
                        </p>
                        <p className="flex justify-between">
                            <span className="font-medium">Spring Boot:</span>
                            <span>{projectInfo.is_spring_boot ? 'Yes' : 'No'}</span>
                        </p>
                    </div>
                </div>
            )}
            
            {/* Endpoints Information */}
            {activeTab === 'endpoints' && (
                <div className="mt-4">
                    {endpoints && endpoints.endpoints && endpoints.endpoints.length > 0 ? (
                        <div className="overflow-x-auto">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-indigo-800">REST API Endpoints</h3>
                                <a 
                                    href={`${API_BASE_URL}/api/repo/export/markdown/${repoName}`}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 text-sm font-medium rounded hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download API Docs (.md)
                                </a>
                            </div>
                            <p className="text-sm text-indigo-700 mb-3">{endpoints.message}</p>
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
                                    {endpoints.endpoints.map((endpoint, index) => (
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
                    ) : (
                        <div className="text-center p-6 bg-gray-50 rounded-md">
                            <h3 className="text-lg font-medium text-gray-900">No Endpoints Found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {endpoints 
                                    ? endpoints.message || "No REST API endpoints were detected in this repository."
                                    : projectInfo && !projectInfo.is_spring_boot
                                        ? "Endpoint detection is only supported for Spring Boot projects."
                                        : "Endpoint information is not available."}
                            </p>
                        </div>
                    )}
                </div>
            )}
            
            {/* Swagger UI */}
            {activeTab === 'swagger' && repoName && (
                <div className="mt-4">
                    <SwaggerViewer repoName={repoName} />
                </div>
            )}
            
            {/* Feature Files */}
            {activeTab === 'features' && repoName && (
                <div className="mt-4">
                    <FeatureFilesViewer repoName={repoName} />
                </div>
            )}
            
            {error && (
                <p className="mt-2 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>
            )}
        </div>
    );
}

export default RepoInputForm; 