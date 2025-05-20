import React, { useState, useEffect } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

function SwaggerViewer({ repoName }) {
    const [swaggerSpec, setSwaggerSpec] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSwaggerSpec = async () => {
            if (!repoName) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError('');
                
                const response = await axios.get(`${API_BASE_URL}/api/repo/swagger/${repoName}`);
                setSwaggerSpec(response.data);
            } catch (err) {
                console.error('Error fetching Swagger spec:', err);
                setError('Failed to load OpenAPI specification. ' + 
                    (err.response?.data?.detail || err.message || 'Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        fetchSwaggerSpec();
    }, [repoName]);

    if (loading) {
        return <div className="text-center p-6"><div className="text-indigo-600">Loading OpenAPI specification...</div></div>;
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 text-sm">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    if (!swaggerSpec) {
        return (
            <div className="text-center p-6 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium text-gray-900">No OpenAPI Specification Available</h3>
                <p className="mt-1 text-sm text-gray-500">
                    No OpenAPI data is available for this repository.
                </p>
            </div>
        );
    }

    return (
        <div className="swagger-container">
            <SwaggerUI spec={swaggerSpec} />
        </div>
    );
}

export default SwaggerViewer; 