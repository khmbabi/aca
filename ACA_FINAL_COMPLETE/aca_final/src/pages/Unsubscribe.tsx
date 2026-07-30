import React, { useState, useEffect } from 'react';
import { Mail, ShieldCheck, AlertCircle, Loader2, ArrowRight, UserMinus } from 'lucide-react';
import { motion } from 'motion/react';

export default function Unsubscribe() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');

    if (!email) {
      setStatus('error');
      setMessage('No email address was provided.');
      return;
    }

    const unsub = async () => {
      try {
        const res = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage('Failed to unsubscribe. Please try again later.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('A connection error occurred.');
      }
    };

    unsub();
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 max-w-lg w-full text-center"
      >
        {status === 'loading' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Unsubscribing...</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium font-mono uppercase tracking-widest text-xs">Removing your email from our list</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-center mx-auto">
              <UserMinus className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Unsubscribed</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">You have been successfully removed from our newsletter. We're sorry to see you go!</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 mt-4"
            >
              Back to Home <ArrowRight size={18} />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Something went wrong</h1>
            <p className="text-red-500 font-bold bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">{message}</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-mono uppercase tracking-widest text-xs"
            >
              Return Home
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
