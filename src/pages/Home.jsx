import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, TrendingUp, Clock, MessageCircle, Tag, Star, ArrowRight, Sparkles, Users, Eye, ChevronDown, Grid, List, Zap } from 'lucide-react';
import { useFirebase } from '../config/Firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Home() {
  const { db } = useFirebase();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [filterTag, setFilterTag] = useState('');
  const [questions, setQuestions] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [tags, setTags] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch tags from Firestore
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsRef = collection(db, 'tags');
        const querySnapshot = await getDocs(tagsRef);
        const tagsData = {};
        querySnapshot.forEach(doc => {
          tagsData[doc.id] = doc.data().tag_name;
        });
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, [db]);

  // Fetch questions from Firestore
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const questionsRef = collection(db, 'questions');
        const querySnapshot = await getDocs(questionsRef);
        const questionsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.created_at?.toDate ? data.created_at.toDate() : new Date();
          const now = new Date();
          const diffInMs = now - createdAt;
          const hoursAgo = Math.floor(diffInMs / (1000 * 60 * 60));
          
          let timeAgo;
          if (hoursAgo < 1) {
            timeAgo = 'just now';
          } else if (hoursAgo < 24) {
            timeAgo = `${hoursAgo} hours ago`;
          } else {
            const daysAgo = Math.floor(hoursAgo / 24);
            timeAgo = `${daysAgo} days ago`;
          }

          // Map tag_ids to tag names
          const questionTags = (data.question_tags || []).map(tagId => tags[tagId] || tagId);

          // Determine status based on activity
          let status = 'new';
          const answerCount = data.answer_count || 0;
          const viewCount = data.view_count || 0;
          const voteCount = data.vote_count || 0;
          
          if (answerCount > 10) {
            status = 'answered';
          } else if (viewCount > 500) {
            status = 'trending';
          } else if (voteCount > 50) {
            status = 'hot';
          }

          return {
            id: data.question_id || doc.id,
            title: data.question_title || 'Untitled',
            description: data.question_description || '',
            tags: questionTags,
            files: data.question_file || [],
            answers: answerCount,
            views: viewCount,
            username: data.user_name || 'Anonymous',
            avatar: data.user_name ? data.user_name.charAt(0) + data.user_name.split(' ')[1]?.charAt(0) || '' : 'A',
            timeAgo,
            votes: voteCount,
            status
          };
        });

        // Filter by search query
        let filteredQuestions = questionsData;
        if (searchQuery) {
          filteredQuestions = questionsData.filter(q => 
            q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            q.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Filter by tag
        if (filterTag) {
          filteredQuestions = filteredQuestions.filter(q => 
            q.tags.some(tag => tag.toLowerCase() === filterTag.toLowerCase())
          );
        }

        // Sort questions
        const sortedQuestions = filteredQuestions.sort((a, b) => {
          if (sortBy === 'newest') {
            return new Date(b.timeAgo) - new Date(a.timeAgo);
          } else if (sortBy === 'popular') {
            return (b.views + b.answers * 10 + b.votes * 5) - (a.views + a.answers * 10 + a.votes * 5);
          } else if (sortBy === 'trending') {
            return b.views - a.views;
          } else if (sortBy === 'unanswered') {
            return a.answers - b.answers;
          }
          return 0;
        });

        setQuestions(sortedQuestions);
        setTotalPages(Math.ceil(sortedQuestions.length / 10) || 1);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [db, sortBy, tags, searchQuery, filterTag]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'trending': return 'from-orange-500 to-red-500';
      case 'hot': return 'from-red-500 to-pink-500';
      case 'answered': return 'from-green-500 to-emerald-500';
      case 'new': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'trending': return <TrendingUp className="w-3 h-3" />;
      case 'hot': return <Zap className="w-3 h-3" />;
      case 'answered': return <MessageCircle className="w-3 h-3" />;
      case 'new': return <Sparkles className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  // Extract popular tags from questions
  const popularTags = {};
  questions.forEach(q => {
    q.tags.forEach(tag => {
      popularTags[tag] = (popularTags[tag] || 0) + 1;
    });
  });
  const trendingTags = Object.entries(popularTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Stack-It
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-6">
                <button className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                  Questions
                </button>
                <button className="text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                  Tags
                </button>
                <button className="text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                  Users
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              
              <button 
                onClick={() => navigate('/create-question')}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                Ask Question
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Developer Questions
              </h1>
              <p className="text-white/60 text-lg">
                Get answers from the community's brightest minds
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/80 hover:text-white transition-all"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filter</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showFilters && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 shadow-2xl">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Sort by</label>
                        <select 
                          value={sortBy} 
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="newest">Newest</option>
                          <option value="popular">Most Popular</option>
                          <option value="trending">Trending</option>
                          <option value="unanswered">Unanswered</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">Tag</label>
                        <select 
                          value={filterTag} 
                          onChange={(e) => setFilterTag(e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">All Tags</option>
                          {trendingTags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trending Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {trendingTags.map((tag) => (
              <span 
                key={tag} 
                onClick={() => setFilterTag(tag)}
                className={`px-3 py-1 backdrop-blur-sm border rounded-full text-sm transition-all cursor-pointer
                  ${filterTag === tag 
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-transparent' 
                    : 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/30 text-purple-300 hover:from-purple-500/30 hover:to-cyan-500/30'
                  }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-white/80 mb-2">No questions found</h3>
            <p className="text-white/60">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            {/* Questions Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {questions.slice((currentPage - 1) * 10, currentPage * 10).map((question) => (
                <div 
                  key={question.id}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10"
                  onClick={() => navigate(`/question/${question.id}`)}
                >
                  {/* Status Badge */}
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getStatusColor(question.status)} shadow-lg`}>
                      {getStatusIcon(question.status)}
                      <span>{question.status}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {question.avatar}
                        </div>
                        <div>
                          <p className="text-white font-medium">{question.username}</p>
                          <p className="text-white/50 text-sm">{question.timeAgo}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-white/60">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span className="text-sm">{question.votes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">{question.views}</span>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-purple-300 transition-colors cursor-pointer">
                      {question.title}
                    </h3>

                    {/* Description */}
                    <p className="text-white/70 mb-4 line-clamp-2">
                      {question.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs text-white/80 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Files */}
                    {question.files.length > 0 && (
                      <div className="flex items-center space-x-2 mb-4">
                        <Tag className="w-4 h-4 text-white/60" />
                        <span className="text-sm text-white/60">
                          {question.files.length} file{question.files.length > 1 ? 's' : ''} attached
                        </span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-white/60">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-sm">{question.answers} answers</span>
                        </div>
                        <div className="flex items-center space-x-1 text-white/60">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">Active</span>
                        </div>
                      </div>
                      
                      <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg text-white/80 hover:from-purple-500/30 hover:to-cyan-500/30 transition-all group">
                        <span className="text-sm">View Details</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center space-x-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      currentPage === i + 1 
                        ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg' 
                        : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/20'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white/60 hover:text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}