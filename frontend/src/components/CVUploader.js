import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

export default function CVUploader() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [rewritten, setRewritten] = useState('');
  const [cvId, setCvId] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'], 'application/msword': ['.doc', '.docx'], 'text/plain': ['.txt'] },
    onDrop: accepted => setFile(accepted[0])
  });

  const uploadAndRewrite = async () => {
    if (!file) return alert('Please select a file');
    setLoading(true);
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('title', file.name);
    if (jobDesc) formData.append('jobDescription', jobDesc);
    
    try {
      const uploadRes = await axios.post('/api/cv/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { cvId } = uploadRes.data;
      setCvId(cvId);
      
      const rewriteRes = await axios.post('/api/cv/rewrite', { cvId, jobDescription: jobDesc });
      setRewritten(rewriteRes.data.rewrittenText);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const download = async (format) => {
    if (!cvId) return;
    window.open(`/api/cv/download/${cvId}/${format}`, '_blank');
  };

  return (
    <div>
      <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500">
        <input {...getInputProps()} />
        {file ? <p>{file.name}</p> : <p>Drag & drop CV (PDF, DOCX, TXT) or click to browse</p>}
      </div>
      
      <textarea
        className="w-full mt-4 p-2 border rounded"
        rows="3"
        placeholder="Optional: Paste job description for targeted rewriting"
        value={jobDesc}
        onChange={e => setJobDesc(e.target.value)}
      />
      
      <button
        onClick={uploadAndRewrite}
        disabled={loading}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Upload & Rewrite CV'}
      </button>
      
      {rewritten && (
        <div className="mt-6">
          <h3 className="font-bold text-lg">Rewritten CV (ATS Optimized)</h3>
          <div className="bg-gray-100 p-4 rounded mt-2 whitespace-pre-wrap">{rewritten}</div>
          <div className="mt-4 space-x-2">
            <button onClick={() => download('pdf')} className="bg-green-600 text-white px-4 py-1 rounded">Download PDF</button>
            <button onClick={() => download('docx')} className="bg-green-600 text-white px-4 py-1 rounded">Download DOCX</button>
            <button onClick={() => download('zip')} className="bg-green-600 text-white px-4 py-1 rounded">Download ZIP (Both)</button>
          </div>
        </div>
      )}
    </div>
  );
}
