import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [token, setToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');

  const verify = async (params: { token?: string, code?: string, email?: string }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/verify-email-with-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to verify email.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('A connection error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');

    if (t) {
      setToken(t);
      verify({ token: t });
    } else {
      setStatus('form');
    }
  }, []);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify({ code, email });
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
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Verifying Your Email...</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Please wait while we secure your account.</p>
          </div>
        )}

        {status === 'form' && (
          <div className="space-y-6 text-left">
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-3xl flex items-center justify-center mx-auto">
              <Mail className="w-10 h-10 text-primary-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight text-center">Verify Account</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-center">Enter your verification code and email to activate your account.</p>
            
            <form onSubmit={handleCodeSubmit} className="space-y-4 pt-4">
              {message && (
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-2">
                  <AlertCircle size={18} /> {message}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none focus:border-primary-500 transition-all dark:text-white font-medium"
                  placeholder="farmer@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">6-Digit Code</label>
                <input 
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 p-4 rounded-2xl outline-none focus:border-primary-500 transition-all dark:text-white font-mono text-xl tracking-[0.5em] text-center"
                  placeholder="000000"
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-xl shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Verify Now"}
              </button>
            </form>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-center mx-auto">
              <ShieldCheck className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Email Verified!</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Your account is now fully activated. You can now access all smart farming features.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight size={18} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Verification Failed</h1>
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
