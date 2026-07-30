import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User, Github, Chrome } from 'lucide-react';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import Logo from './Logo';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendEmailVerification
} from 'firebase/auth';
import { Phone, Hash } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import TranslatedText from './TranslatedText';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'signup';
  addToast: (msg: string, type: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode, addToast }) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'phone'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    // Reset state when opening/closing or changing mode
    setConfirmationResult(null);
    setVerificationCode('');
  }, [initialMode, isOpen]);

  // Clean up reCAPTCHA when modal closes
  useEffect(() => {
    if (!isOpen && recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneSignIn = async () => {
    if (!phoneNumber) {
      addToast('Please enter a phone number.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
        });
      }
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      addToast('Verification code sent to ' + phoneNumber, 'success');
    } catch (error: any) {
      console.error("Phone Auth Error:", error);
      let message = error.message;
      if (error.code === 'auth/operation-not-allowed') {
        message = "Phone authentication is not enabled in your Firebase Console. Please enable it in Authentication > Sign-in method.";
      } else if (error.code === 'auth/billing-not-enabled') {
        message = "Phone authentication requires a Firebase Blaze plan for this region. Please contact the administrator.";
      } else if (error.message.includes('reCAPTCHA has already been rendered')) {
        // Fallback if the ref check somehow fails
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear();
          recaptchaVerifierRef.current = null;
        }
        message = "Connection issue. Please try clicking 'Send Code' again.";
      }
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      addToast('Please enter the verification code.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await confirmationResult.confirm(verificationCode);
      addToast('Successfully signed in!', 'success');
      onClose();
    } catch (error: any) {
      console.error("Verification Error:", error);
      addToast('Invalid code. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, message: "At least 8 characters" },
      { regex: /[A-Z]/, message: "An uppercase letter" },
      { regex: /[0-9]/, message: "A numeric character" },
      { regex: /[^A-Za-z0-9]/, message: "A special character" }
    ];
    
    const missing = requirements
      .filter(req => !req.regex.test(pass))
      .map(req => req.message);
      
    return missing;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    
    if (mode === 'signup') {
      const missing = validatePassword(password);
      if (missing.length > 0) {
        setPasswordError(`Password must contain: ${missing.join(', ')}`);
        return;
      }
    }

    if (mode === 'phone') {
      if (!confirmationResult) {
        await handlePhoneSignIn();
      } else {
        await handleVerifyCode();
      }
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Log security event (login)
        fetch('/api/log-security-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: user.email, 
            event: "New Login", 
            details: `A login was detected at ${new Date().toLocaleString()}` 
          })
        }).catch(err => console.error("Event log error:", err));

        addToast(t('auth.welcome_back') || 'Welcome back!', 'success');
        onClose();
      } else if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, {
          displayName: `${firstName} ${lastName}`
        });

        // Send verification email
        try {
          // Call our custom server-side verification route
          await fetch('/api/send-custom-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: user.email, 
              displayName: `${firstName} ${lastName}` 
            })
          });
          addToast('A verification link has been sent to your email with our custom theme. Please check your inbox!', 'info');
        } catch (err) {
          console.error("Error sending verification email:", err);
          addToast('Account created, but we had trouble sending the verification email. You can verify it later in settings.', 'warning');
        }

        // Create profile in Firestore
        const path = `profiles/${user.uid}`;
        try {
          await setDoc(doc(db, 'profiles', user.uid), {
            id: user.uid,
            firstName,
            lastName,
            email,
            avatarUrl: '',
            is_verified: false,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }

        addToast(t('auth.account_created') || 'Account created successfully!', 'success');
        onClose();
      } else if (mode === 'forgot') {
        if (!email) {
          addToast(t('auth.email_required') || 'Please enter your email address.', 'error');
          return;
        }
        // Call our custom server-side password reset route
        await fetch('/api/send-custom-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        addToast(t('auth.reset_sent') || 'A custom password reset link has been sent to your email! Please check your inbox.', 'success');
        setMode('login');
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      let message = error.message.replace(/Firebase: /g, '').replace(/\(auth\/.*\)\.?/g, '').trim();
      
      if (error.code === 'auth/operation-not-allowed') {
        message = "Email/Password sign-in is not enabled for this project. Please try Continue with Google instead.";
      } else if (error.code === 'auth/popup-blocked') {
        message = "The sign-in popup was blocked by your browser. Please allow popups and try again.";
      } else if (error.code === 'auth/password-does-not-meet-requirements') {
        message = "Your password doesn't meet the security requirements (8+ chars, uppercase, digit, & special char).";
      } else if (error.code === 'auth/weak-password') {
        message = "This password is too weak. Please use a stronger combination.";
      }
      addToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      addToast(t('auth.google_success') || 'Signed in with Google!', 'success');
      onClose();
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      let message = error.message;
      if (error.code === 'auth/popup-blocked') {
        message = "The sign-in popup was blocked by your browser. Please allow popups and try again.";
      }
      addToast(message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <Logo size="md" showText={false} className="justify-center mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              <TranslatedText>
                {mode === 'login' ? 'Welcome Back' : 
                 mode === 'signup' ? 'Join ACA' : 
                 mode === 'phone' ? 'Phone Login' :
                 'Reset Password'}
              </TranslatedText>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              <TranslatedText>
                {mode === 'login' ? 'Enter your credentials to access your farm' : 
                 mode === 'signup' ? 'Start your journey towards sustainable farming' : 
                 mode === 'phone' ? 'Enter your phone number to receive a secure code' :
                 'Enter your email to receive a reset link'}
              </TranslatedText>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div id="recaptcha-container"></div>
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder={t("auth.first_name") || "First Name"}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder={t("auth.last_name") || "Last Name"}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {mode === 'phone' ? (
              <div className="space-y-4">
                {!confirmationResult ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="6-digit code"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder={t("auth.email") || "Email Address"}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        placeholder={t("auth.password") || "Password"}
                        required
                        className={cn(
                          "w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white",
                          passwordError && "border-red-500 ring-1 ring-red-500"
                        )}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {passwordError && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1">
                        {passwordError}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button 
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
                >
                  <TranslatedText>Forgot password?</TranslatedText>
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <TranslatedText>Processing...</TranslatedText>
              ) : mode === 'login' ? (
                <TranslatedText>Sign In</TranslatedText>
              ) : mode === 'signup' ? (
                <TranslatedText>Create Account</TranslatedText>
              ) : mode === 'phone' ? (
                <TranslatedText>{!confirmationResult ? 'Send Code' : 'Verify Code'}</TranslatedText>
              ) : (
                <TranslatedText>Send Reset Link</TranslatedText>
              )}
            </button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                    <TranslatedText>Or continue with</TranslatedText>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center gap-3 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold text-gray-700 dark:text-white group"
                >
                  <Chrome size={20} className="text-red-500 group-hover:scale-110 transition-transform" />
                  <TranslatedText>Google</TranslatedText>
                </button>
                <button 
                  onClick={() => setMode('phone')}
                  className="flex items-center justify-center gap-3 py-4 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold text-gray-700 dark:text-white group"
                >
                  <Phone size={20} className="text-primary-600 group-hover:scale-110 transition-transform" />
                  <TranslatedText>Phone</TranslatedText>
                </button>
              </div>
            </>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <TranslatedText>
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              </TranslatedText>
              <button 
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <TranslatedText>{mode === 'login' ? 'Sign up' : 'Sign in'}</TranslatedText>
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;
