import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as api from "../../services/api.js";

export const EmailVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const userId = location.state?.userId;
  const devOtp = location.state?.otp; // OTP from development mode

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !userId) {
        alert("Session lost. Please sign up again.");
        navigate('/signup');
        return;
    }

    try {
      setLoading(true);
      const response = await api.verifyEmail({ userId, otp });
      if (response.success) {
        alert('Email Verified! Please Login.');
        navigate('/login');
      } else {
        alert(response.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verification error:', err);
      alert(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!userId) {
      alert("Session lost. Please sign up again.");
      navigate('/signup');
      return;
    }

    try {
      setResending(true);
      const response = await api.resendOTP({ userId });
      if (response.success) {
        alert(`OTP resent! ${response.otp ? `Your new OTP is: ${response.otp}` : 'Check your email.'}`);
      } else {
        alert(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend error:', err);
      alert(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  if (!email || !userId) return <div className="text-center p-10">No email provided. <a href="/signup" className="underline">Signup</a></div>;

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-sm w-full bg-white p-8 rounded-xl shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Verify Email</h2>
        <p className="text-slate-500 mb-6">Enter the 6-digit code sent to <br/><strong>{email}</strong></p>
        
        <form onSubmit={handleVerify} className="space-y-6">
          <input 
            type="text" 
            placeholder="000000"
            maxLength={6}
            className="w-full text-center text-2xl tracking-widest px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        
        <button
          onClick={handleResendOTP}
          disabled={resending}
          className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg disabled:opacity-50"
        >
          {resending ? 'Resending...' : 'Resend OTP'}
        </button>
        
        {devOtp && (
          <p className="mt-4 text-xs text-green-600 bg-green-50 p-2 rounded">
            Development OTP: {devOtp}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-400">Check console for OTP if email fails</p>
      </div>
    </div>
  );
};