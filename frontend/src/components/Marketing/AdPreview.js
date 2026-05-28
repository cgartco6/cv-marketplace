import React from 'react';

export default function AdPreview({ ad, platform }) {
  const platformStyles = {
    facebook: 'bg-blue-50 border-blue-200',
    google: 'bg-red-50 border-red-200',
    linkedin: 'bg-blue-100 border-blue-300',
    twitter: 'bg-gray-100 border-gray-300',
    instagram: 'bg-pink-50 border-pink-200',
  };

  return (
    <div className={`border rounded-lg p-4 mb-4 ${platformStyles[platform] || 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-sm uppercase">{platform}</span>
        <span className="text-xs text-gray-500">ID: {ad._id?.slice(-6)}</span>
      </div>
      <h3 className="text-lg font-bold">{ad.headline}</h3>
      <p className="text-gray-700 mt-2">{ad.description}</p>
      <div className="mt-3 flex justify-between items-center">
        <span className="bg-blue-600 text-white px-4 py-1 rounded text-sm inline-block">{ad.cta}</span>
        <span className="text-xs text-gray-500">Status: {ad.status}</span>
      </div>
      {ad.metrics && (
        <div className="mt-2 text-xs text-gray-500">
          Impressions: {ad.metrics.impressions} | Clicks: {ad.metrics.clicks} | Conversions: {ad.metrics.conversions}
        </div>
      )}
    </div>
  );
}
