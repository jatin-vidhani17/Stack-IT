import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuestionCard({ question }) {
  const navigate = useNavigate();

  return (
    <div
      className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer"
      onClick={() => navigate(`/question/${question.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-400 hover:text-blue-300 mb-2">
            {question.title}
          </h3>
          <p className="text-gray-300 mb-4 line-clamp-2">
            {question.description}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
            <span className="text-gray-500">•</span>
            <span>{question.username}</span>
            <span className="text-gray-500">•</span>
            <span>{question.timeAgo}</span>
          </div>
        </div>
        <div className="flex items-center justify-center w-16 h-16 bg-gray-700 rounded-lg ml-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{question.answers}</div>
            <div className="text-xs text-gray-400">ans</div>
          </div>
        </div>
      </div>
    </div>
  );
}
