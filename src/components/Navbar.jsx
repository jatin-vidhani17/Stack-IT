import React from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
  const navigate = useNavigate();
  return (
    <header className="border-b border-gray-700 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">StackIt</h1>
          <div className="flex items-center space-x-2">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => navigate('/create-question')}>
              Ask New Question
            </button>
            <button 
              onClick={() => setSortBy(sortBy === 'newest' ? 'unanswered' : 'newest')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
            >
              <span>{sortBy === 'newest' ? 'Newest' : 'Unanswered'}</span>
              <ChevronDown size={16} />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors">
              <span>more</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 px-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button
            className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800 transition-colors"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </div>
      </div>
    </header>
  );
}
