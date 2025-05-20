import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function FeatureFilesViewer({ repoName }) {
    const [featureFiles, setFeatureFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFeatureFiles = async () => {
            if (!repoName) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');
                
                const response = await axios.get(`${API_BASE_URL}/api/repo/features/${repoName}`);
                
                if (response.data.status === 'success') {
                    setFeatureFiles(response.data.feature_files);
                } else {
                    setError(response.data.message || 'Failed to load feature files');
                }
            } catch (err) {
                console.error('Error fetching feature files:', err);
                setError('Failed to load feature files. ' + 
                    (err.response?.data?.detail || err.message || 'Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        fetchFeatureFiles();
    }, [repoName]);

    if (loading) {
        return <div className="text-center p-6"><div className="text-indigo-600">Loading feature files...</div></div>;
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-sm">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    if (!featureFiles || featureFiles.length === 0) {
        return (
            <div className="text-center p-6 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium text-gray-900">No Feature Files Available</h3>
                <p className="mt-1 text-sm text-gray-500">
                    No feature files could be generated for this repository.
                </p>
            </div>
        );
    }

    return (
        <div className="feature-files-container">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-indigo-800">Generated Feature Files</h3>
                <a 
                    href={`${API_BASE_URL}/api/repo/features/download/${repoName}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 border border-indigo-600 text-indigo-600 text-sm font-medium rounded hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download All Feature Files
                </a>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-4">
                {featureFiles.map((file, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4 hover:border-indigo-300 hover:shadow transition">
                        <h4 className="font-medium text-indigo-700">{file.filename}</h4>
                        <p className="text-xs text-gray-500">Controller: {file.controller} ({file.endpoint_count} endpoints)</p>
                        <pre className="mt-2 bg-gray-50 p-3 rounded text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                            {file.preview}
                        </pre>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FeatureFilesViewer; 