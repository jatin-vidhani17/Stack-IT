import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import QuestionCard from '../components/Home/QuestionCard';
import CreateQuestion from '../components/Home/CreateQuestion';
import Pagination from '../components/Home/Pagination';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  const questions = [
    {
      id: 1,
      title: "How to join 2 columns in SQL",
      description: "Combine first and last name in SQL...",
      tags: ["sql", "join"],
      answers: 5,
      username: "User Name",
      timeAgo: "2 hours ago"
    },
    {
      id: 2,
      title: "Question.....",
      description: "Descriptions.....",
      tags: ["javascript", "react"],
      answers: 3,
      username: "User Name",
      timeAgo: "4 hours ago"
    },
    {
      id: 3,
      title: "Question.....",
      description: "Descriptions.....",
      tags: ["python", "django"],
      answers: 2,
      username: "User Name",
      timeAgo: "6 hours ago"
    }
  ];

  const totalPages = 7;

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