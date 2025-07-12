import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Strikethrough, List, ListOrdered, Smile,
  Link, Image, AlignLeft, AlignCenter, AlignRight,
  Code, Underline, Upload, X
} from 'lucide-react';

export default function AnswerDialog({ isOpen, onClose, onSubmit, initialContent = '' }) {
  const [answer, setAnswer] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const answerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Common emojis for quick insertion
  const commonEmojis = ['😀', '😊', '😂', '🤔', '😍', '👍', '👎', '❤️', '🔥', '💯', '🚀', '💡', '⚡', '🎉', '🤖', '💻'];

  useEffect(() => {
    const handleClickOutside = (e) => {
      const picker = document.getElementById('emoji-picker-answer');
      const emojiButton = document.querySelector('[title="Insert Emoji"]');

      if (picker &&
        !picker.contains(e.target) &&
        !emojiButton.contains(e.target)) {
        setIsEmojiPickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async () => {
    if (!answerRef.current?.textContent?.trim()) return;
    setIsSubmitting(true);
    await onSubmit({
      content: answerRef.current.innerHTML,
      attachedFiles
    });
    setIsSubmitting(false);
    onClose();
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    answerRef.current?.focus();
  };

  const insertEmoji = (emoji) => {
    execCommand('insertText', emoji);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          execCommand('insertImage', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/json'];
      return file.size <= maxSize && allowedTypes.some(type => file.type.startsWith(type));
    });

    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const handleFileRemove = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (file.type.startsWith('text/')) return '📝';
    return '📎';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Your Answer</h2>
          
          {/* Rich Text Editor Toolbar */}
          <div className="bg-gray-700 border border-gray-600 rounded-t-lg p-2 flex flex-wrap items-center gap-2">
            {/* Text Formatting */}
            <div className="flex items-center space-x-1 border-r border-gray-600 pr-2">
              <button
                type="button"
                onClick={() => execCommand('bold')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Bold"
              >
                <Bold size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCommand('italic')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Italic"
              >
                <Italic size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCommand('underline')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Underline"
              >
                <Underline size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCommand('strikeThrough')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Strikethrough"
              >
                <Strikethrough size={16} />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center space-x-1 border-r border-gray-600 pr-2">
              <button
                type="button"
                onClick={() => execCommand('insertUnorderedList')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Bullet List"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCommand('insertOrderedList')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Numbered List"
              >
                <ListOrdered size={16} />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center space-x-1 border-r border-gray-600 pr-2">
              <button
                type="button"
                onClick={() => execCommand('justifyLeft')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Align Left"
              >
                <AlignLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCommand('justifyCenter')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Align Center"
              >
                <AlignCenter size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCommand('justifyRight')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Align Right"
              >
                <AlignRight size={16} />
              </button>
            </div>

            {/* Insert Options */}
            <div className="flex items-center space-x-1 border-r border-gray-600 pr-2">
              <button
                type="button"
                onClick={insertLink}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Insert Link"
              >
                <Link size={16} />
              </button>
              <button
                type="button"
                onClick={insertImage}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Insert Image"
              >
                <Image size={16} />
              </button>
              <button
                type="button"
                onClick={() => execCommand('formatBlock', 'pre')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                title="Code Block"
              >
                <Code size={16} />
              </button>
            </div>

            {/* Emoji Picker */}
            <div className="flex items-center space-x-1">
              <div className="relative">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded"
                  title="Insert Emoji"
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                >
                  <Smile size={16} />
                </button>
                {isEmojiPickerOpen && (
                  <div
                    id="emoji-picker-answer"
                    className="absolute top-full left-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg p-2 z-50 w-64 max-h-64 overflow-y-auto"
                  >
                    <div className="grid grid-cols-6 gap-1">
                      {commonEmojis.map((emoji, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => insertEmoji(emoji)}
                          className="p-1 hover:bg-gray-600 rounded text-lg flex items-center justify-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div
            ref={answerRef}
            contentEditable
            className="w-full min-h-[200px] p-4 bg-gray-700 border border-t-0 border-gray-600 rounded-b-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
            style={{ maxHeight: '400px' }}
            placeholder="Write your answer here..."
          />

          {/* File Attachment */}
          <div className="mt-4">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
              >
                <Upload size={16} />
                <span>Upload Files</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.txt,.json"
              />
              <span className="text-xs text-gray-400">
                Images, PDFs, text files (max 10MB each)
              </span>
            </div>

            {/* Attached Files List */}
            {attachedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getFileIcon(file)}</span>
                      <div>
                        <p className="text-sm text-white">{file.name}</p>
                        <p className="text-xs text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileRemove(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !answerRef.current?.textContent?.trim()}
                className={`px-6 py-2 rounded-md transition-colors ${
                  isSubmitting || !answerRef.current?.textContent?.trim()
                    ? 'bg-blue-800 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Posting...</span>
                  </div>
                ) : (
                  'Post Your Answer'
                )}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
