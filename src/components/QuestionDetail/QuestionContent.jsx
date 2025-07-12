import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function QuestionContent({ question, onVote }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-4">
        {/* Vote buttons */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => onVote('up', question.id, 'question')}
            className={`p-1 rounded hover:bg-gray-700 ${
              question.userVote === 'up' ? 'text-green-500' : 'text-gray-400'
            }`}
          >
            <ThumbsUp size={20} />
          </button>
          <span className="text-lg font-semibold">{question.votes}</span>
          <button
            onClick={() => onVote('down', question.id, 'question')}
            className={`p-1 rounded hover:bg-gray-700 ${
              question.userVote === 'down' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <ThumbsDown size={20} />
          </button>
        </div>

        {/* Question content */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">{question.title}</h1>
          <div className="prose prose-invert max-w-none mb-4">
            <p>{question.description}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {question.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-600 text-sm rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Asked by {question.username}</span>
              <span>{question.timeAgo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}