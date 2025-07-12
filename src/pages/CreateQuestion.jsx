import React, { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft,
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Smile,
    Link,
    Image,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Upload,
    X,
    FileText,
    Eye,
    Code,
    Underline
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateQuestion() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        tags: []
    });
    const [currentTag, setCurrentTag] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const descriptionRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    // Common emojis for quick insertion
    const commonEmojis = ['😀', '😊', '😂', '🤔', '😍', '👍', '👎', '❤️', '🔥', '💯', '🚀', '💡', '⚡', '🎉', '🤖', '💻'];
    useEffect(() => {
        const handleClickOutside = (e) => {
            const picker = document.getElementById('emoji-picker');
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
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleDescriptionChange = (e) => {
        setFormData(prev => ({
            ...prev,
            description: e.target.innerHTML
        }));
        if (errors.description) {
            setErrors(prev => ({
                ...prev,
                description: ''
            }));
        }
    };

    const handleTagAdd = (e) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            const newTag = currentTag.trim().toLowerCase();
            if (!formData.tags.includes(newTag) && formData.tags.length < 5) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, newTag]
                }));
                setCurrentTag('');
            }
        }
    };

    const handleTagRemove = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
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

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        descriptionRef.current?.focus();
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

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 10) {
            newErrors.title = 'Title must be at least 10 characters';
        }

        const textContent = descriptionRef.current?.textContent || '';
        if (!textContent.trim()) {
            newErrors.description = 'Description is required';
        } else if (textContent.length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
        }

        if (formData.tags.length === 0) {
            newErrors.tags = 'At least one tag is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            console.log('Question submission:', {
                ...formData,
                description: descriptionRef.current?.innerHTML,
                attachedFiles: attachedFiles.map(f => f.name)
            });
            setIsLoading(false);
            alert('Question submitted successfully!');
        }, 2000);
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return '🖼️';
        if (file.type === 'application/pdf') return '📄';
        if (file.type.startsWith('text/')) return '📝';
        return '📎';
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="border-b border-gray-700 px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleBackToHome}
                            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span>Back to Home</span>
                        </button>
                        <h1 className="text-2xl font-bold text-white">StackIt</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 transition-colors"
                        >
                            <Eye size={16} />
                            <span>{showPreview ? 'Edit' : 'Preview'}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-xl">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Ask a New Question</h2>
                        <p className="text-gray-400">
                            Get help from the community by asking clear, detailed questions
                        </p>
                    </div>

                    {!showPreview ? (
                        <div className="space-y-6">
                            {/* Title Field */}
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                                    Question Title <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.title ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                    placeholder="What's your programming question? Be specific."
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-400">
                                    Be specific and imagine you're asking a question to another person
                                </p>
                            </div>

                            {/* Description Field with Rich Text Editor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description <span className="text-red-400">*</span>
                                </label>

                                {/* Rich Text Editor Toolbar */}
                                <div className="bg-gray-700 border border-gray-600 rounded-t-lg p-2 flex flex-wrap items-center gap-2">
                                    {/* Text Formatting */}
                                    <div className="flex items-center space-x-1 border-r border-gray-600 pr-2">
                                        <button
                                            type="button"
                                            onClick={() => execCommand('bold')}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                            title="Bold"
                                        >
                                            <Bold size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => execCommand('italic')}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                            title="Italic"
                                        >
                                            <Italic size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => execCommand('underline')}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                            title="Underline"
                                        >
                                            <Underline size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => execCommand('strikeThrough')}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
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
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                            title="Bullet List"
                                        >
                                            <List size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => execCommand('insertOrderedList')}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
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
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                            title="Align Left"
                                        >
                                            <AlignLeft size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => execCommand('justifyCenter')}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                            title="Align Center"
                                        >
                                            <AlignCenter size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => execCommand('justifyRight')}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
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
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                            title="Insert Link"
                                        >
                                            <Link size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={insertImage}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                            title="Insert Image"
                                        >
                                            <Image size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => execCommand('formatBlock', 'pre')}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
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
                                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors"
                                                title="Insert Emoji"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEmojiPickerOpen(!isEmojiPickerOpen);
                                                }}
                                            >
                                                <Smile size={16} />
                                            </button>
                                            {isEmojiPickerOpen && (
                                                <div
                                                    id="emoji-picker"
                                                    className="absolute top-full left-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg p-2 z-50 w-64 max-h-64 overflow-y-auto"
                                                >
                                                    <div className="grid grid-cols-6 gap-1">
                                                        {commonEmojis.map((emoji, index) => (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    insertEmoji(emoji);
                                                                    // Don't close the picker here
                                                                }}
                                                                className="p-1 hover:bg-gray-600 rounded text-lg flex items-center justify-center"
                                                                style={{ fontFamily: 'system-ui, sans-serif' }}
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

                                {/* Rich Text Editor */}
                                <div
                                    ref={descriptionRef}
                                    contentEditable
                                    onInput={handleDescriptionChange}
                                    className={`w-full min-h-64 p-4 bg-gray-700 border border-t-0 rounded-b-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto ${errors.description ? 'border-red-500' : 'border-gray-600'
                                        }`}
                                    style={{ maxHeight: '400px' }}
                                    placeholder="Describe your problem in detail. Include what you've tried and what specific help you need."
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-400">{errors.description}</p>
                                )}
                            </div>

                            {/* File Attachment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Attach Files (Optional)
                                </label>
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

                            {/* Tags Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Tags <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={handleTagAdd}
                                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Add tags (press Enter to add, max 5 tags)"
                                />
                                {errors.tags && (
                                    <p className="mt-1 text-sm text-red-400">{errors.tags}</p>
                                )}

                                {/* Tags Display */}
                                {formData.tags.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {formData.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleTagRemove(tag)}
                                                    className="ml-2 text-blue-200 hover:text-white transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p className="mt-1 text-xs text-gray-400">
                                    Add up to 5 tags to describe what your question is about
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isLoading
                                        ? 'bg-gray-600 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800'
                                        } text-white`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Posting Question...</span>
                                        </div>
                                    ) : (
                                        'Post Your Question'
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Preview Mode */
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Preview</h3>
                                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-blue-400 mb-4">
                                        {formData.title || 'Question Title'}
                                    </h4>
                                    <div
                                        className="prose prose-invert max-w-none mb-4"
                                        dangerouslySetInnerHTML={{ __html: formData.description || 'Question description...' }}
                                    />
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {formData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs text-gray-300"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {attachedFiles.length > 0 && (
                                        <div className="border-t border-gray-600 pt-4">
                                            <p className="text-sm text-gray-400 mb-2">Attached Files:</p>
                                            <div className="space-y-1">
                                                {attachedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-300">
                                                        <span>{getFileIcon(file)}</span>
                                                        <span>{file.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}