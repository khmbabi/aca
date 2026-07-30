import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function ResetPassword() {
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!t) {
      setStatus('error');
      setMessage('Invalid or missing reset token.');
    } else {
      setToken(t);
      setStatus('form');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    
    const requirements = [
      { regex: /.{8,}/, message: "At least 8 characters" },
      { regex: /[A-Z]/, message: "An uppercase letter" },
      { regex: /[0-9]/, message: "A numeric character" },
      { regex: /[^A-Za-z0-9]/, message: "A special character" }
    ];
    
    const missing = requirements
      .filter(req => !req.regex.test(password))
      .map(req => req.message);
      
    if (missing.length > 0) {
      setMessage(`Password must contain: ${missing.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reset-password-with-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
      } else {
        setMessage(data.error || 'Failed to reset password.');
      }
    } catch (err) {
      setMessage('A connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 max-w-lg w-full text-center"
      >
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Checking Link...</h1>
          </div>
        )}

        {status === 'form' && (
          <div className="space-y-6 text-left">
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-center">New Password</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-center">Secure your farm with a new, strong password.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              {message && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2">
                  <AlertCircle size={18} /> {message}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none focus:border-primary-500 transition-all dark:text-white"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none focus:border-primary-500 transition-all dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-xl shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Update Password"}
              </button>
            </form>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Password Reset!</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Your password has been updated successfully. You can now sign in with your new credentials.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              Sign In <ArrowRight size={18} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Error</h1>
            <p className="text-red-500 font-bold bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">{message}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-mono uppercase tracking-widest text-xs"
            >
              Back to Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
