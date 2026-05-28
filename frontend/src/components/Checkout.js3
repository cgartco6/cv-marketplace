import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
export default function Checkout() {
  const [searchParams] = useSearchParams();
  const tier = searchParams.get('tier');
  const billing = searchParams.get('billing');
  const [method, setMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);
  const [eftDetails, setEftDetails] = useState(null);
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/payment/create-checkout', { tier, billingPeriod: billing, paymentMethod: method, successUrl: `${window.location.origin}/dashboard`, cancelUrl: `${window.location.origin}/pricing` });
      if (method === 'eft') setEftDetails(res.data.eftDetails);
      else if (res.data.paymentUrl) window.location.href = res.data.paymentUrl;
    } catch (err) { alert(err.response?.data?.error); } finally { setLoading(false); }
  };
  return (<div className="max-w-md mx-auto bg-white p-6 rounded shadow"><h2 className="text-2xl font-bold mb-4">Complete Payment</h2><p>Plan: {tier} ({billing})</p><div className="my-4"><label className="block mb-2">Payment Method</label><select value={method} onChange={e=>setMethod(e.target.value)} className="w-full border p-2 rounded"><option value="stripe">Card (Stripe)</option><option value="paypal">PayPal</option><option value="payfast">PayFast</option><option value="ozow">Ozow</option><option value="eft">Bank Transfer (EFT)</option></select></div><button onClick={handleCheckout} disabled={loading} className="w-full btn-primary">{loading?'Processing...':'Pay Now'}</button>{eftDetails && (<div className="mt-4 p-3 bg-gray-100 rounded"><p>Transfer R{eftDetails.amount} to:</p><p>Bank: {eftDetails.bankDetails.accountName}</p><p>Account: {eftDetails.bankDetails.accountNumber}</p><p>Reference: {eftDetails.eftReference}</p></div>)}</div>);
}
