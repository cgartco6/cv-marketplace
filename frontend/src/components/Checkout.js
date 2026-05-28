import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const tier = searchParams.get('tier');
  const billing = searchParams.get('billing');
  const [method, setMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [eftDetails, setEftDetails] = useState(null);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!tier || !billing) {
      setError('Invalid plan selection');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/payment/create-checkout', {
        tier,
        billingPeriod: billing,
        paymentMethod: method,
        successUrl: `${window.location.origin}/dashboard`,
        cancelUrl: `${window.location.origin}/pricing`
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (method === 'eft') {
        setEftDetails(res.data.eftDetails);
      } else if (res.data.paymentUrl) {
        window.location.href = res.data.paymentUrl;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!tier || !billing) {
    return <div className="text-center py-12 text-red-600">Invalid plan selection. Go back and choose a plan.</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Complete Your Payment</h2>
      <p className="mb-2"><strong>Plan:</strong> {tier} ({billing === 'monthly' ? 'Monthly' : 'One-time'})</p>
      <p className="mb-4"><strong>Amount:</strong> R{TIER_PRICES[tier]?.[billing] || 'N/A'}</p>

      <div className="mb-4">
        <label className="block mb-2 font-medium">Payment Method</label>
        <select
          value={method}
          onChange={e => { setMethod(e.target.value); setEftDetails(null); }}
          className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="stripe">💳 Credit/Debit Card (Stripe)</option>
          <option value="paypal">💰 PayPal</option>
          <option value="payfast">🇿🇦 PayFast (South Africa)</option>
          <option value="ozow">🏦 Ozow (EFT)</option>
          <option value="eft">🏧 Direct Bank Transfer (EFT)</option>
        </select>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : '💰 Pay Now'}
      </button>

      {eftDetails && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
          <p className="font-bold">Bank Transfer Instructions</p>
          <p>Amount: <strong>R{eftDetails.amount}</strong></p>
          <p>Bank: {eftDetails.bankDetails.accountName}</p>
          <p>Account: {eftDetails.bankDetails.accountNumber}</p>
          <p>Reference: <code>{eftDetails.eftReference}</code></p>
          <p className="text-xs text-gray-600 mt-2">After transfer, your account will be upgraded within 24h.</p>
        </div>
      )}
    </div>
  );
}

// Helper (should be imported from a config, but inline for completeness)
const TIER_PRICES = {
  starter: { monthly: 149, once: 250 },
  professional: { monthly: 349, once: 699 },
  enterprise: { monthly: 699, once: 1499 }
};
