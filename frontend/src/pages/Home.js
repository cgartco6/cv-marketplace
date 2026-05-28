import React, { useState } from 'react';
import PricingPlans from '../components/PricingPlans';
import CVUploader from '../components/CVUploader';
export default function Home() {
  const [tab, setTab] = useState('upload');
  return (
    <div>
      <nav className="bg-white shadow p-4"><h1 className="text-2xl font-bold text-blue-600">CV Marketplace</h1></nav>
      <div className="container py-8">
        <div className="flex border-b mb-6">
          {['upload','pricing'].map(t => <button key={t} className={`py-2 px-4 ${tab===t?'border-b-2 border-blue-600 text-blue-600':'text-gray-500'}`} onClick={()=>setTab(t)}>{t==='upload'?'Upload & Rewrite':'Pricing'}</button>)}
        </div>
        <div className="card">{tab==='upload'?<CVUploader />:<PricingPlans />}</div>
      </div>
    </div>
  );
}
