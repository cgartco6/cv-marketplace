import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function CVUploader() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [rewritten, setRewritten] = useState('');
  const [cvId, setCvId] = useState(null);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx'], 'text/plain': ['.txt'] },
    maxSize: 5 * 1024 * 1024,
    onDrop: accepted => { setFile(accepted[0]); setError(''); },
    onDropRejected: () => setError('File too large or invalid type. Max 5MB, PDF/DOCX/TXT only.')
  });

  const uploadAndRewrite = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('title', file.name);
    if (jobDesc) formData.append('jobDescription', jobDesc);

    try {
      const token = localStorage.getItem('token');
      const uploadRes = await axios.post('/api/cv/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      const { cvId } = uploadRes.data;
      setCvId(cvId);

      const rewriteRes = await axios.post('/api/cv/rewrite', { cvId, jobDescription: jobDesc }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRewritten(rewriteRes.data.rewrittenText);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const download = async (format) => {
    if (!cvId) return;
    const token = localStorage.getItem('token');
    window.open(`/api/cv/download/${cvId}/${format}?token=${token}`, '_blank');
  };

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition">
        <input {...getInputProps()} />
        {file ? <p className="text-green-600">✅ {file.name}</p> : <p>📁 Drag & drop CV (PDF, DOCX, TXT) or click to browse</p>}
        <p className="text-xs text-gray-500 mt-2">Max 5MB</p>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <textarea
        className="w-full mt-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="3"
        placeholder="Optional: Paste job description for targeted rewriting"
        value={jobDesc}
        onChange={e => setJobDesc(e.target.value)}
      />

      <button
        onClick={uploadAndRewrite}
        disabled={loading || !file}
        className="mt-4 w-full bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50 hover:bg-blue-700 transition"
      >
        {loading ? '⏳ Processing...' : '🚀 Upload & Rewrite CV'}
      </button>

      {rewritten && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">✨ Rewritten CV (ATS Optimized)</h3>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm">
            {rewritten}
          </div>
          <div className="mt-4 flex space-x-2">
            <button onClick={() => download('pdf')} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">📄 Download PDF</button>
            <button onClick={() => download('docx')} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">📝 Download DOCX</button>
            <button onClick={() => download('zip')} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">🗜️ Download ZIP (Both)</button>
          </div>
        </div>
      )}
    </div>
  );
}
