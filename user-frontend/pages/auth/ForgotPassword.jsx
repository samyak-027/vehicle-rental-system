import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from "../../services/api.js";

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await api.forgotPassword(email);
    setLoading(false);
    // Navigate to reset page with email in state
    navigate('/reset-password', { state: { email } });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center mb-4">Reset Password</h2>
        <p className="text-slate-500 text-center mb-8 text-sm">Enter your email address and we'll send you an OTP code to reset your password.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input 
              type="email" 
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-70"
          >
            {loading ? 'Sending Code...' : 'Send OTP Code'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
             <Link to="/login" className="text-sm text-slate-600 hover:text-primary font-medium">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};