import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Repository API endpoints
export const submitRepo = async (repoData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/repo/clone`, repoData);
    return response.data;
  } catch (error) {
    console.error('Error submitting repository:', error);
    throw error;
  }
};

export const analyzeRepo = async (repoName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repo/analyze/${repoName}`);
    return response.data;
  } catch (error) {
    console.error('Error analyzing repository:', error);
    throw error;
  }
};

export const getEndpoints = async (repoName) => {
  try {
    const url = `${API_BASE_URL}/repo/endpoints/${repoName}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting endpoints:', error);
    throw error;
  }
};

export const getSwagger = async (repoName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repo/swagger/${repoName}`);
    return response.data;
  } catch (error) {
    console.error('Error getting swagger spec:', error);
    throw error;
  }
};

export const getMarkdown = async (repoName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repo/export/markdown/${repoName}`);
    return response.data;
  } catch (error) {
    console.error('Error getting markdown export:', error);
    throw error;
  }
};

export const getFeatures = async (repoName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repo/features/${repoName}`);
    return response.data;
  } catch (error) {
    console.error('Error getting features:', error);
    throw error;
  }
};

export const getEntities = async (repoName) => {
  try {
    const url = `${API_BASE_URL}/repo/entities/${repoName}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting entities:', error);
    throw error;
  }
};

export const getEntityDiagram = async (repoName, diagramType = 'class') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/repo/diagrams/entities/${repoName}?diagram_type=${diagramType}`);
    return response.data;
  } catch (error) {
    console.error('Error getting entity diagram:', error);
    throw error;
  }
};

export const publishToConfluence = async (publishData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/repo/publish/confluence`, publishData);
    return response.data;
  } catch (error) {
    console.error('Error publishing to Confluence:', error);
    throw error;
  }
};

// New endpoints for Iterations 11-13

export const getFlows = async (repoName) => {
  try {
    const url = `${API_BASE_URL}/repo/flows/${repoName}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting endpoint flows:', error);
    throw error;
  }
};

export const getSchemaOverview = async (repoName) => {
  try {
    const url = `${API_BASE_URL}/repo/schema-overview/${repoName}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error getting schema overview:', error);
    throw error;
  }
}; 