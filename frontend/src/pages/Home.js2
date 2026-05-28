import React, { useState } from 'react';
import PricingPlans from '../components/PricingPlans';
import CVUploader from '../components/CVUploader';
import ATSAnalyzer from '../components/ATSAnalyzer';
import InterviewQnA from '../components/InterviewQnA';
import AITutor from '../components/AITutor';

export default function Home() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-bold text-blue-600">CV Marketplace</h1>
          <div>
            <button className="mr-4 text-gray-600">Login</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Sign Up</button>
          </div>
        </div>
      </nav>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">AI-Powered CV & Interview Prep</h2>
          <p className="text-xl text-gray-600">Get ATS-optimized CVs, interview Q&A, and an AI tutor to land your dream job</p>
        </div>
        
        <div className="flex border-b mb-8">
          {['upload', 'ats', 'qna', 'tutor', 'pricing'].map(tab => (
            <button
              key={tab}
              className={`py-2 px-4 font-medium ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'upload' && 'Upload & Rewrite'}
              {tab === 'ats' && 'ATS Score'}
              {tab === 'qna' && 'Interview Q&A'}
              {tab === 'tutor' && 'AI Tutor'}
              {tab === 'pricing' && 'Pricing'}
            </button>
          ))}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'upload' && <CVUploader />}
          {activeTab === 'ats' && <ATSAnalyzer />}
          {activeTab === 'qna' && <InterviewQnA />}
          {activeTab === 'tutor' && <AITutor />}
          {activeTab === 'pricing' && <PricingPlans />}
        </div>
      </div>
    </div>
  );
}
