import React from 'react';
import { useNavigate } from 'react-router-dom';

const plans = {
  starter: { monthly: 149, once: 250, features: ['5 CV rewrites/month', 'ATS score', 'Basic Q&A'] },
  professional: { monthly: 349, once: 699, features: ['Unlimited rewrites', 'Advanced ATS', 'AI Tutor', 'Download PDF/DOCX'] },
  enterprise: { monthly: 699, once: 1499, features: ['Everything in Professional', 'Team access', 'Priority support', 'Custom branding'] }
};

export default function PricingPlans() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSelect = (tier, billing) => {
    if (!token) {
      alert('Please login or sign up first');
      return;
    }
    navigate(`/checkout?tier=${tier}&billing=${billing}`);
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Object.entries(plans).map(([key, plan]) => (
        <div key={key} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-bold capitalize">{key}</h3>
          <p className="text-3xl font-bold mt-2">R{plan.monthly}<span className="text-sm font-normal">/month</span></p>
          <p className="text-gray-500">or R{plan.once} one-time</p>
          <ul className="mt-4 space-y-2">
            {plan.features.map(f => <li key={f} className="flex items-center"><span className="text-green-500 mr-2">✓</span>{f}</li>)}
          </ul>
          <button onClick={() => handleSelect(key, 'monthly')} className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Subscribe Monthly
          </button>
          <button onClick={() => handleSelect(key, 'once')} className="mt-2 w-full border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50">
            Pay Once
          </button>
        </div>
      ))}
    </div>
  );
}
