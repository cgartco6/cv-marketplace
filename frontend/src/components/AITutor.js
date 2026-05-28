import React, { useState } from 'react';
import axios from 'axios';

export default function AITutor() {
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getFeedback = async () => {
    if (!question || !userAnswer) {
      setError('Question and your answer are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/cv/ai-tutor-feedback',
        { question, userAnswer, correctAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback(res.data.feedback);
    } catch (err) {
      setError(err.response?.data?.error || 'Feedback failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        className="w-full border p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="3"
        placeholder="Interview Question (e.g., Tell me about yourself)"
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />
      <textarea
        className="w-full border p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="3"
        placeholder="Your Answer"
        value={userAnswer}
        onChange={e => setUserAnswer(e.target.value)}
      />
      <textarea
        className="w-full border p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="3"
        placeholder="Ideal Answer (optional, but improves feedback)"
        value={correctAnswer}
        onChange={e => setCorrectAnswer(e.target.value)}
      />
      <button
        onClick={getFeedback}
        disabled={loading}
        className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 disabled:opacity-50"
      >
        {loading ? 'Thinking...' : '🤖 Get AI Tutor Feedback'}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {feedback && (
        <div className="mt-4 bg-gray-100 p-4 rounded whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
          {feedback}
        </div>
      )}
    </div>
  );
}
