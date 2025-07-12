import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Check } from 'lucide-react';

export default function AnswerItem({ 
  answer, 
  onVote, 
  onAccept, 
  onAddComment, 
  showCommentInput,
  answerToComment,
  comment,
  onCommentChange,
  onCommentSubmit 
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-start space-x-4">
        {/* Vote buttons */}
        <div className="flex flex-col items-center space-y-2">
          <button
            onClick={() => onVote('up', answer.id, 'answer')}
            className={`p-1 rounded hover:bg-gray-700 ${
              answer.userVote === 'up' ? 'text-green-500' : 'text-gray-400'
            }`}
          >
            <ThumbsUp size={20} />
          </button>
          <span className="text-lg font-semibold">{answer.votes}</span>
          <button
            onClick={() => onVote('down', answer.id, 'answer')}
            className={`p-1 rounded hover:bg-gray-700 ${
              answer.userVote === 'down' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <ThumbsDown size={20} />
          </button>
          <button
            onClick={() => onAccept(answer.id)}
            className={`p-1 rounded hover:bg-gray-700 ${
              answer.isAccepted ? 'text-green-500' : 'text-gray-400'
            }`}
            title={answer.isAccepted ? "Accepted Answer" : "Mark as Accepted"}
          >
            <Check size={20} />
          </button>
        </div>

        {/* Answer content */}
        <div className="flex-1">
          <div className="prose prose-invert max-w-none mb-4">
            <p className="whitespace-pre-wrap">{answer.content}</p>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Answered by {answer.username}</span>
              <span>{answer.timeAgo}</span>
            </div>
            <button
              onClick={() => onAddComment(answer.id)}
              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white"
            >
              <MessageSquare size={16} />
              <span>Add Comment</span>
            </button>
          </div>

          {/* Comments */}
          {answer.comments.length > 0 && (
            <div className="pl-4 border-l border-gray-700 space-y-2">
              {answer.comments.map((comment) => (
                <div key={comment.id} className="text-sm text-gray-300">
                  <p>{comment.content}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                    <span>{comment.username}</span>
                    <span>•</span>
                    <span>{comment.timeAgo}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          {showCommentInput && answerToComment === answer.id && (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={comment}
                  onChange={onCommentChange}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => onCommentSubmit(answer.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Comment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
