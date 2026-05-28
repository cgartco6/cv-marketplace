import React, { useState } from 'react';
import axios from 'axios';

export default function InterviewQnA() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [cvSummary, setCvSummary] = useState('');
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!jobTitle || !company) {
      setError('Job title and company are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/cv/generate-interview-qa',
        { jobTitle, company, cvSummary },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(res.data.questions);
    } catch (err) {
      setError(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        className="w-full border p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Job Title (e.g., Senior Software Engineer)"
        value={jobTitle}
        onChange={e => setJobTitle(e.target.value)}
      />
      <input
        className="w-full border p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Company Name"
        value={company}
        onChange={e => setCompany(e.target.value)}
      />
      <textarea
        className="w-full border p-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="4"
        placeholder="Paste your CV summary (optional, but recommended)"
        value={cvSummary}
        onChange={e => setCvSummary(e.target.value)}
      />
      <button
        onClick={generate}
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : '🎤 Generate Interview Q&A'}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {questions && (
        <div className="mt-4 bg-gray-100 p-4 rounded whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
          {questions}
        </div>
      )}
    </div>
  );
}
