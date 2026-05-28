import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
export default function CVUploader() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [rewritten, setRewritten] = useState('');
  const [cvId, setCvId] = useState(null);
  const { getRootProps, getInputProps } = useDropzone({ onDrop: a => setFile(a[0]) });
  const upload = async () => {
    if(!file) return;
    setLoading(true);
    const fd = new FormData(); fd.append('cv', file); fd.append('title', file.name); if(jobDesc) fd.append('jobDescription', jobDesc);
    const uploadRes = await axios.post('/api/cv/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setCvId(uploadRes.data.cvId);
    const rewriteRes = await axios.post('/api/cv/rewrite', { cvId: uploadRes.data.cvId, jobDescription: jobDesc });
    setRewritten(rewriteRes.data.rewrittenText);
    setLoading(false);
  };
  return (<div><div {...getRootProps()} className="border-dashed border-2 p-8 text-center cursor-pointer"><input {...getInputProps()} />{file?file.name:'Drag or click CV'}</div><textarea className="w-full mt-2 p-2 border" rows="3" placeholder="Job description" value={jobDesc} onChange={e=>setJobDesc(e.target.value)} /><button onClick={upload} className="mt-2 btn-primary" disabled={loading}>{loading?'Processing...':'Rewrite CV'}</button>{rewritten && <div className="mt-4 bg-gray-100 p-4 whitespace-pre-wrap">{rewritten}</div>}</div>);
}
