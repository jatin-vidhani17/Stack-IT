import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/Home/QuestionCard';
import Pagination from '../components/Home/Pagination';
import { useFirebase } from '../config/Firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Home() {
  const { db } = useFirebase();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [questions, setQuestions] = useState([]);
  const [totalPages, setTotalPages] = useState(7);
  const [tags, setTags] = useState({}); // Store tags as id:name pairs

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

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsRef = collection(db, 'questions');
        const querySnapshot = await getDocs(questionsRef);
        const questionsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.created_at?.toDate ? data.created_at.toDate() : new Date();
          const now = new Date();
          const diffInMs = now - createdAt;
          const hoursAgo = Math.floor(diffInMs / (1000 * 60 * 60));
          const timeAgo = hoursAgo <= 1 ? 'just now' : `${hoursAgo} hours ago`;

          // Map tag_ids to tag names
          const questionTags = (data.question_tags || []).map(tagId => tags[tagId] || tagId);

          return {
            id: data.question_id || doc.id,
            title: data.question_title || 'Untitled',
            description: data.question_description || '',
            tags: questionTags,
            files: data.question_file || [],
            answers: 0,
            username: 'User Name',
            timeAgo
          };
        });

        const sortedQuestions = questionsData.sort((a, b) => {
          if (sortBy === 'newest') {
            return new Date(b.timeAgo) - new Date(a.timeAgo);
          }
          return 0;
        });

        setQuestions(sortedQuestions);
        setTotalPages(Math.ceil(questionsData.length / 10) || 1);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, [db, sortBy, tags]); // Add tags to dependencies

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {questions.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />
      </main>
    </div>
  );
}