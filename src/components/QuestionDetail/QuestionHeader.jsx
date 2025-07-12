import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuestionHeader() {
  const navigate = useNavigate();
  
  return (
    <header className="border-b border-gray-700 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Questions</span>
          </button>
          <h1 className="text-2xl font-bold text-white">StackIt</h1>
        </div>
      </div>
    </header>
  );
}