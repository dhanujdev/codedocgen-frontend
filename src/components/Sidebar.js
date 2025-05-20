import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Server as ServerIcon, 
  Code as CodeIcon, 
  Box as BoxIcon, 
  Network as NetworkIcon, 
  Upload as UploadIcon 
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/', icon: HomeIcon },
  { name: 'Endpoints', path: '/endpoints', icon: ServerIcon },
  { name: 'Features', path: '/features', icon: CodeIcon },
  { name: 'Entities', path: '/entities', icon: BoxIcon },
  { name: 'Diagrams', path: '/diagrams', icon: NetworkIcon },
  { name: 'Publish', path: '/publish', icon: UploadIcon },
];

const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-64 bg-white shadow-sm border-r h-full">
      <div className="px-6 py-4 border-b">
        <h1 className="text-xl font-bold text-indigo-700">CodeDocGen</h1>
        <p className="text-xs text-gray-500">Documentation Dashboard</p>
      </div>
      <nav className="mt-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <button
                  onClick={() => onTabChange(item.name.toLowerCase())}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    activeTab === item.name.toLowerCase()
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 