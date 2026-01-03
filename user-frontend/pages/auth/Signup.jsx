import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from "../../services/api.js";

export const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    try {
      const response = await api.register({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password 
      });
      
      if (response.success) {
        // Show OTP if available in development
        if (response.otp) {
          alert(`Registration successful! Your OTP is: ${response.otp}`);
        }
        
        // Pass userId and email to verification page
        navigate('/verify-email', { 
          state: { 
            email: formData.email, 
            userId: response.userId,
            otp: response.otp // Pass OTP for development
          } 
        });
      } else {
        alert(response.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.message;
      
      if (errorMessage === 'Email already registered') {
        alert('Email already registered. If you haven\'t verified your email yet, please check your email for the OTP or try logging in.');
      } else {
        alert(errorMessage || 'Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center mb-8">Create Account</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input 
              type="text" 
              className="mt-1 w-full px-4 py-2 border rounded-lg"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              className="mt-1 w-full px-4 py-2 border rounded-lg"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              className="mt-1 w-full px-4 py-2 border rounded-lg"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
            <input 
              type="password" 
              className="mt-1 w-full px-4 py-2 border rounded-lg"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required 
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-sky-600 text-white font-bold py-2.5 rounded-lg transition-colors">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
};