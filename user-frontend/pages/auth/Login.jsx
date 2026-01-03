import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../context/store.jsx';
import * as api from "../../services/api.js";

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { dispatch } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.login({ email, password });
      
      if (response.success) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { 
            user: response.user, 
            token: response.token 
          } 
        });
        
        // Redirect logic
        const params = new URLSearchParams(location.search);
        const redirect = params.get('redirect') || '/';
        navigate(redirect);
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message;
      
      if (errorMessage === 'Verify email first') {
        setError('Please verify your email first. Check your email for the OTP or go to signup if you need to resend it.');
      } else {
        setError(errorMessage || 'Invalid email or password');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-slate-500 text-center mb-8">Sign in to access your account</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
            {error.includes('verify your email') && (
              <div className="mt-2">
                <Link to="/signup" className="text-primary underline">
                  Go to signup to resend verification
                </Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <input 
              type="password" 
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg transition-colors">
            Log In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};