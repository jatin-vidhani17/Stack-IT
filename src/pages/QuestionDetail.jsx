import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/Firebase';
import { doc, getDoc, collection, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import QuestionHeader from '../components/QuestionDetail/QuestionHeader';
import QuestionContent from '../components/QuestionDetail/QuestionContent';
import AnswerItem from '../components/QuestionDetail/AnswerItem';
import AnswerDialog from '../components/QuestionDetail/AnswerDialog';

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [answerToComment, setAnswerToComment] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current user's username from sessionStorage
  const userSession = JSON.parse(sessionStorage.getItem('userSession'));
  const currentUsername = userSession ? userSession.username : 'Anonymous';

  // Function to calculate time ago
  const getTimeAgo = (createdAt) => {
    if (!(createdAt instanceof Date)) return 'just now';
    const now = new Date();
    const diffInSeconds = Math.floor((now - createdAt) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  };

  // Fetch question and answers from Firestore
  useEffect(() => {
    const fetchQuestionData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch question
        const questionRef = doc(db, 'questions', id);
        const questionSnap = await getDoc(questionRef);
        if (!questionSnap.exists()) {
          throw new Error('Question not found');
        }
        const questionData = questionSnap.data();

        // Fetch tag names from tags collection
        const tagIds = questionData.question_tags || [];
        const tagNames = await Promise.all(
          tagIds.map(async (tagId) => {
            const tagRef = doc(db, 'tags', tagId);
            const tagSnap = await getDoc(tagRef);
            return tagSnap.exists() ? tagSnap.data().tag_name : tagId; // Fallback to tagId if not found
          })
        );

        const questionFormatted = {
          id: questionSnap.id,
          title: questionData.question_title,
          description: questionData.question_description,
          tags: tagNames,
          answers: 0, // Will be updated after fetching answers
          username: questionData.username || 'Anonymous',
          timeAgo: getTimeAgo(questionData.created_at.toDate()),
          votes: questionData.votes || 0,
          userVote: null,
        };

        // Fetch answers
        const answersRef = collection(db, 'questions', id, 'answers');
        const answersSnap = await getDocs(answersRef);
        const answersFormatted = await Promise.all(
          answersSnap.docs.map(async (answerDoc) => {
            const answerData = answerDoc.data();
            // Fetch comments for each answer
            const commentsRef = collection(db, 'questions', id, 'answers', answerDoc.id, 'comments');
            const commentsSnap = await getDocs(commentsRef);
            const comments = commentsSnap.docs.map((commentDoc) => ({
              id: commentDoc.id,
              content: commentDoc.data().content,
              username: commentDoc.data().username || 'Anonymous',
              timeAgo: getTimeAgo(commentDoc.data().created_at.toDate()),
            }));
            return {
              id: answerDoc.id,
              content: answerData.content,
              username: answerData.username || 'Anonymous',
              timeAgo: getTimeAgo(answerData.created_at.toDate()),
              votes: answerData.votes || 0,
              userVote: null,
              isAccepted: answerData.isAccepted || false,
              comments,
            };
          })
        );

        questionFormatted.answers = answersFormatted.length;
        setQuestion(questionFormatted);
        setAnswers(answersFormatted);
      } catch (err) {
        console.error('Error fetching question:', err);
        setError('Failed to load question details');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionData();
  }, [id]);

  const handleVote = (type, itemId, itemType) => {
    if (itemType === 'question') {
      setQuestion(prev => ({
        ...prev,
        votes: prev.votes + (type === 'up' ? 1 : -1),
        userVote: type
      }));
    } else {
      setAnswers(prev => prev.map(ans => {
        if (ans.id === itemId) {
          return {
            ...ans,
            votes: ans.votes + (type === 'up' ? 1 : -1),
            userVote: type
          };
        }
        return ans;
      }));
    }
  };

  const handleAcceptAnswer = (answerId) => {
    setAnswers(prev => prev.map(ans => ({
      ...ans,
      isAccepted: ans.id === answerId
    })));
  };

  const handleAddComment = (answerId) => {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now(),
      content: comment,
      username: currentUsername,
      timeAgo: 'just now'
    };

    setAnswers(prev => prev.map(ans => {
      if (ans.id === answerId) {
        return {
          ...ans,
          comments: [...ans.comments, newComment]
        };
      }
      return ans;
    }));

    setComment('');
    setShowCommentInput(false);
    setAnswerToComment(null);
  };

  const handleSubmitAnswer = (answerContent) => {
    if (!answerContent.trim()) return;

    const newAnswer = {
      id: Date.now(),
      content: answerContent.content, // Extract content from object
      username: currentUsername,
      timeAgo: 'just now',
      votes: 0,
      userVote: null,
      isAccepted: false,
      comments: [],
      questionId: id // Include questionId in newAnswer
    };

    setAnswers(prev => [...prev, newAnswer]);
    setQuestion(prev => ({
      ...prev,
      answers: prev.answers + 1
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <QuestionHeader onBack={() => navigate('/')} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <QuestionContent
          question={question}
          onVote={(type) => handleVote(type, question.id, 'question')}
        />

        <div className="space-y-6 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{answers.length} Answers</h2>
            <button
              onClick={() => setIsAnswerDialogOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Post Your Answer
            </button>
          </div>
          
          {answers.map((answer) => (
            <AnswerItem
              key={answer.id}
              answer={answer}
              onVote={(type) => handleVote(type, answer.id, 'answer')}
              onAccept={() => handleAcceptAnswer(answer.id)}
              onAddComment={() => {
                setShowCommentInput(true);
                setAnswerToComment(answer.id);
              }}
              showCommentInput={showCommentInput && answerToComment === answer.id}
              commentValue={comment}
              onCommentChange={(e) => setComment(e.target.value)}
              onCommentSubmit={() => handleAddComment(answer.id)}
            />
          ))}
        </div>

        <AnswerDialog
          isOpen={isAnswerDialogOpen}
          onClose={() => setIsAnswerDialogOpen(false)}
          onSubmit={handleSubmitAnswer}
          id={id}
        />
      </main>
    </div>
  );
}