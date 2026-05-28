import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function LandingPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await axios.get(`/api/marketing/landing/${slug}`);
        setPage(res.data);
      } catch (err) {
        setError('Landing page not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;
  if (!page) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">{page.headline}</h1>
        <div className="prose lg:prose-xl mx-auto" dangerouslySetInnerHTML={{ __html: page.body }} />
        <div className="text-center mt-8">
          <a href="/signup" className="inline-block bg-blue-600 text-white text-lg px-8 py-3 rounded hover:bg-blue-700">
            {page.ctaText}
          </a>
        </div>
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Results may vary. This is a career development tool.</p>
          <p><a href="/privacy" className="underline">Privacy Policy</a> | <a href="/terms" className="underline">Terms of Service</a></p>
        </div>
      </div>
    </div>
  );
}
