import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';
import { ApiError } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      setUser(me);
      return me;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        return null;
      }
      throw err;
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);
  const requestOtp = async (email) => {
    return await authApi.requestOtp(email);
  };

  const verifyOtp = async (email, otp) => {
    const verifiedUser = await authApi.verifyOtp(email, otp);
    setUser(verifiedUser);
    return verifiedUser;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, requestOtp, verifyOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
