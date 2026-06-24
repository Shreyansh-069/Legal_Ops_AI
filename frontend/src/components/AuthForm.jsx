import React, { useState } from 'react';

export default function AuthForm({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isSignUp && password !== confirmPassword) {
      setError("The passwords you entered do not match. Please check them and try again.");
      return;
    }

    try {
      const endpoint = isSignUp ? "/api/signup" : "/api/login";
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "We could not verify your details. Please check your credentials.");
        return;
      }

      if (isSignUp) {
        setIsSignUp(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        alert("Your account was created successfully. You can now log in with your email and password.");
      } else {
        onAuthSuccess();
      }
    } catch (err) {
      setError("We could not connect to the server. Please verify your internet connection.");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#f5f2eb] p-4">
      <div className="w-full max-w-md bg-white border border-[#dcd6c5] p-8 rounded-lg space-y-6">
        
        {/* Header Block */}
        <div className="text-center space-y-2">
          <span className="inline-block text-[11px] font-mono tracking-wider text-[#8a7c6e] uppercase">
            Workspace entry
          </span>
          <h2 className="text-2xl font-bold text-[#4a3728]">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-xs text-[#8a7c6e] leading-relaxed max-w-xs mx-auto">
            Please sign in to access your dashboard, review legal files, and view recommendations.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#4a3728] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#faf9f6] border border-[#dcd6c5] rounded-lg text-sm text-[#4a3728] placeholder-[#a8a29e] focus:border-[#4a3728] focus:outline-none transition-colors"
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#4a3728] mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#faf9f6] border border-[#dcd6c5] rounded-lg text-sm text-[#4a3728] placeholder-[#a8a29e] focus:border-[#4a3728] focus:outline-none transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-[#4a3728] mb-1.5">
                Confirm your password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-[#faf9f6] border border-[#dcd6c5] rounded-lg text-sm text-[#4a3728] placeholder-[#a8a29e] focus:border-[#4a3728] focus:outline-none transition-colors"
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#4a3728] hover:bg-[#604a39] text-white font-semibold rounded-lg transition-colors text-sm cursor-pointer mt-3"
          >
            {isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#f5f2eb]">
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); setPassword(""); setConfirmPassword(""); }}
            className="text-xs text-[#8a7c6e] hover:text-[#4a3728] hover:underline font-medium cursor-pointer bg-transparent border-none transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in here" : "Don't have an account yet? Create one here"}
          </button>
        </div>
      </div>
    </div>
  );
}