import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as api from "../../services/api.js";

export const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    const success = await api.resetPassword(email, otp, newPassword);
    setLoading(false);

    if (success) {
      alert('Password reset successfully! Please login.');
      navigate('/login');
    } else {
      alert('Invalid OTP or Email. Try 123456');
    }
  };

  if (!email) {
      return (
          <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                  <p>Invalid Request. Please start from Forgot Password.</p>
                  <button onClick={() => navigate('/forgot-password')} className="text-primary underline mt-2">Go Back</button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Set New Password</h2>
        <p className="text-slate-500 text-center mb-6 text-sm">Enter the OTP sent to <strong>{email}</strong></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">OTP Code</label>
            <input 
              type="text" 
              placeholder="123456"
              className="mt-1 w-full px-4 py-2 border rounded-lg tracking-widest text-center"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">New Password</label>
            <input 
              type="password" 
              className="mt-1 w-full px-4 py-2 border rounded-lg"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
            <input 
              type="password" 
              className="mt-1 w-full px-4 py-2 border rounded-lg"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p className="mt-4 text-xs text-center text-slate-400">Mock OTP: 123456</p>
      </div>
    </div>
  );
};