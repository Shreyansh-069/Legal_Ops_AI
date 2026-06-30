import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout, { AuthLink } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export default function Signup() {
  const { signup, verifyOtp, requestOtp, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('signup'); // 'signup' or 'otp'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  if (user) {
    navigate('/chat', { replace: true });
    return null;
  }

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(username, email, password);
      setStep('otp');
      setCooldown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not register. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await verifyOtp(email, otp);
      navigate('/chat', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not verify code. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError('');
    try {
      await requestOtp(email);
      setCooldown(60);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not request verification code. Try again.');
    }
  };

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Sign up to save your legal questions and come back to them later."
      footer={
        <>
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      {step === 'signup' ? (
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 animate-in fade-in">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-xs font-medium text-text-secondary mb-1.5">
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface border border-border-light rounded-md px-3 py-2.5 text-sm text-text placeholder-text-faint focus:outline-none focus:border-brass transition-colors"
              placeholder="legal_eagle"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-text-secondary mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-border-light rounded-md px-3 py-2.5 text-sm text-text placeholder-text-faint focus:outline-none focus:border-brass transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-text-secondary mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface border border-border-light rounded-md px-3 py-2.5 text-sm text-text placeholder-text-faint focus:outline-none focus:border-brass transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-text-secondary mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-surface border border-border-light rounded-md px-3 py-2.5 text-sm text-text placeholder-text-faint focus:outline-none focus:border-brass transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 mt-2 rounded-md bg-brass text-white text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Registering...' : 'Register & Verify'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 animate-in fade-in">
              {error}
            </div>
          )}

          <div className="text-xs text-text-secondary text-center mb-2 leading-relaxed">
            We sent a 6-digit verification code to <strong className="text-text">{email}</strong>.
          </div>

          <div>
            <label htmlFor="otp" className="block text-xs font-medium text-text-secondary mb-1.5">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-surface border border-border-light rounded-md px-3 py-2.5 text-center text-lg font-mono tracking-[0.7em] text-text placeholder-text-faint focus:outline-none focus:border-brass transition-colors"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="w-full py-2.5 rounded-md bg-brass text-white text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Verifying...' : 'Verify & Create Account'}
          </button>

          <div className="flex flex-row justify-between text-[11px] mt-4 pt-2 border-t border-border-light">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0}
              className={`font-semibold transition-colors ${
                cooldown > 0 ? 'text-text-faint cursor-not-allowed' : 'text-brass hover:opacity-80 cursor-pointer'
              }`}
            >
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('signup');
                setError('');
                setOtp('');
              }}
              className="text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              Change details
            </button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
