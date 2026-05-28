import React, { useState } from 'react';
import axios from 'axios';

export default function ATSAnalyzer({ cvId: propCvId }) {
  const [cvId, setCvId] = useState(propCvId || '');
  const [score, setScore] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!cvId) {
      setError('Please enter a CV ID');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/cv/ats-score/${cvId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScore(res.data.atsScore);
      setAnalysis(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="CV ID (from upload)"
        value={cvId}
        onChange={e => setCvId(e.target.value)}
        className="w-full border p-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={analyze}
        disabled={loading}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Analyzing...' : '📊 Get ATS Score'}
      </button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      {score !== null && (
        <div className="mt-4">
          <h3 className="font-bold text-lg">ATS Score: {score}/100</h3>
          <div className="bg-gray-100 p-4 rounded mt-2 whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}
