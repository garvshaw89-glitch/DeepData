import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Globe, 
  ShieldCheck, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { UserProfile, AuthSession, MarketRegion } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: AuthSession | null;
  onAuthSuccess: (session: AuthSession) => void;
  onLogout: () => void;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD' | 'PROFILE';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onAuthSuccess,
  onLogout,
}) => {
  const [mode, setMode] = useState<AuthMode>(currentSession ? 'PROFILE' : 'LOGIN');
  
  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(currentSession?.user.email || '');
  const [password, setPassword] = useState('');
  const [preferredRegion, setPreferredRegion] = useState<MarketRegion | 'ALL'>('ALL');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Status feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedResetToken, setGeneratedResetToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed.');
      }

      setSuccessMessage('Authentication successful! Welcome back.');
      onAuthSuccess(data.session);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, preferredRegion }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      setSuccessMessage('Account created successfully!');
      onAuthSuccess(data.session);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.resetToken) {
        setGeneratedResetToken(data.resetToken);
        setResetToken(data.resetToken);
        setSuccessMessage('Recovery token generated! Copy token or proceed to Reset Password step.');
      } else {
        setSuccessMessage(data.message || 'Reset instructions sent to your email.');
      }
    } catch (err: any) {
      setErrorMessage('Failed to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Password reset failed.');
      }

      setSuccessMessage('Password successfully updated! You can now log in.');
      setTimeout(() => {
        setMode('LOGIN');
        setPassword('');
        setErrorMessage('');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid or expired token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#09090B] border border-[#1F1F23] rounded-lg shadow-2xl overflow-hidden font-mono text-[#A1A1AA]">
        
        {/* Header */}
        <div className="bg-[#121214] border-b border-[#1F1F23] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 bg-cyan-500 rounded-sm flex items-center justify-center text-black font-black text-[10px]">
              D
            </div>
            <div>
              <h2 className="text-white text-xs font-bold tracking-tight uppercase">
                {mode === 'LOGIN' && 'AUTHENTICATION_GATEWAY'}
                {mode === 'REGISTER' && 'CREATE_INVESTOR_ACCOUNT'}
                {mode === 'FORGOT_PASSWORD' && 'RECOVER_ACCESS_CREDENTIALS'}
                {mode === 'RESET_PASSWORD' && 'UPDATE_SECURE_PASSWORD'}
                {mode === 'PROFILE' && 'ACTIVE_SESSION_PROFILE'}
              </h2>
              <p className="text-[10px] text-gray-500">DEEPDATA Auth Engine v2.4</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white p-1 rounded hover:bg-[#1F1F23] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector (for non-profile views) */}
        {mode !== 'PROFILE' && (
          <div className="grid grid-cols-2 bg-[#000000] border-b border-[#1F1F23] text-[11px] font-bold">
            <button
              type="button"
              onClick={() => { setMode('LOGIN'); resetMessages(); }}
              className={`py-2.5 text-center transition-colors cursor-pointer ${
                mode === 'LOGIN' ? 'text-cyan-400 bg-[#121214] border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              LOG IN
            </button>
            <button
              type="button"
              onClick={() => { setMode('REGISTER'); resetMessages(); }}
              className={`py-2.5 text-center transition-colors cursor-pointer ${
                mode === 'REGISTER' ? 'text-cyan-400 bg-[#121214] border-b-2 border-cyan-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              REGISTER
            </button>
          </div>
        )}

        {/* Feedback alerts */}
        <div className="px-5 pt-3">
          {errorMessage && (
            <div className="flex items-start space-x-2 bg-rose-950/40 border border-rose-800/60 text-rose-300 p-2.5 rounded text-[11px]">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="flex items-start space-x-2 bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 p-2.5 rounded text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-5">

          {/* 1. LOGIN MODE */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@deepdata.com"
                    className="w-full bg-[#121214] text-white pl-8 pr-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] text-gray-400 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('FORGOT_PASSWORD'); resetMessages(); }}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#121214] text-white pl-8 pr-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Demo Account Quick Fill Button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('investor@deepdata.com');
                    setPassword('password123');
                  }}
                  className="text-[10px] text-gray-400 hover:text-cyan-400 flex items-center space-x-1 cursor-pointer"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Autofill Demo Investor Credentials</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition-colors flex items-center justify-center space-x-2 cursor-pointer text-xs mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>AUTHENTICATE & ENTER</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTER MODE */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Full Name / Organization
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Garv Shaw"
                    className="w-full bg-[#121214] text-white pl-8 pr-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@deepdata.com"
                    className="w-full bg-[#121214] text-white pl-8 pr-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Secure Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full bg-[#121214] text-white pl-8 pr-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Preferred Market Focus
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {[
                    { id: 'INDIA', label: 'Indian Markets (NSE/BSE)' },
                    { id: 'GLOBAL', label: 'Worldwide Markets' },
                    { id: 'ALL', label: 'All Global Markets' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPreferredRegion(item.id as any)}
                      className={`p-2 rounded border text-center transition-colors cursor-pointer ${
                        preferredRegion === item.id 
                          ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold' 
                          : 'bg-[#121214] border-[#1F1F23] text-gray-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition-colors flex items-center justify-center space-x-2 cursor-pointer text-xs mt-2"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>CREATE DEEPDATA ACCOUNT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD MODE */}
          {mode === 'FORGOT_PASSWORD' && (
            <form onSubmit={handleForgotPassword} className="space-y-3.5 text-xs">
              <p className="text-[11px] text-gray-400">
                Enter your registered DEEPDATA email to generate a password recovery token.
              </p>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@deepdata.com"
                    className="w-full bg-[#121214] text-white pl-8 pr-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none text-xs"
                  />
                </div>
              </div>

              {generatedResetToken && (
                <div className="p-2.5 bg-[#121214] border border-cyan-800 rounded space-y-1">
                  <p className="text-[10px] text-cyan-400 font-bold">RECOVERY TOKEN GENERATED:</p>
                  <code className="text-[11px] text-white bg-black px-2 py-1 rounded block select-all font-mono">
                    {generatedResetToken}
                  </code>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition-colors flex items-center justify-center space-x-2 cursor-pointer text-xs"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>GENERATE RECOVERY TOKEN</span>}
              </button>

              <div className="flex justify-between items-center text-[10px] pt-2 border-t border-[#1F1F23]">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-gray-400 hover:text-white cursor-pointer"
                >
                  ← Back to Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode('RESET_PASSWORD')}
                  className="text-cyan-400 hover:underline cursor-pointer font-bold"
                >
                  Have Token? Reset Password →
                </button>
              </div>
            </form>
          )}

          {/* 4. RESET PASSWORD MODE */}
          {mode === 'RESET_PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  Reset Token
                </label>
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Paste reset token here"
                  className="w-full bg-[#121214] text-white px-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#121214] text-white pl-8 pr-3 py-2 rounded border border-[#1F1F23] focus:border-cyan-500 outline-none text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition-colors flex items-center justify-center space-x-2 cursor-pointer text-xs"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>UPDATE PASSWORD</span>}
              </button>

              <div className="pt-2 border-t border-[#1F1F23] text-center">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-[10px] text-gray-400 hover:text-white cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* 5. ACTIVE SESSION PROFILE MODE */}
          {mode === 'PROFILE' && currentSession && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center space-x-3 bg-[#121214] p-3 rounded border border-[#1F1F23]">
                <div className="w-10 h-10 rounded bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold text-sm">
                  {currentSession.user.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{currentSession.user.fullName}</h3>
                  <p className="text-[10px] text-gray-400">{currentSession.user.email}</p>
                  <div className="flex items-center space-x-2 mt-1 text-[9px]">
                    <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded uppercase font-bold">
                      {currentSession.user.role}
                    </span>
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>SESSION_ACTIVE</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Session Telemetry details */}
              <div className="space-y-2 bg-[#09090B] border border-[#1F1F23] p-3 rounded text-[10px]">
                <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                  <span className="text-gray-500">USER_ID:</span>
                  <span className="text-gray-300 select-all font-mono">{currentSession.user.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                  <span className="text-gray-500">REGION_PREFERENCE:</span>
                  <span className="text-cyan-400 font-bold">{currentSession.user.preferredRegion}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1F1F23]">
                  <span className="text-gray-500">SESSION_EXPIRES:</span>
                  <span className="text-gray-300">{new Date(currentSession.expiresAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">BEARER_TOKEN:</span>
                  <span className="text-gray-400 font-mono truncate max-w-[180px]">{currentSession.token}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-[#1F1F23] hover:bg-[#27272A] text-white py-2 rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  CLOSE PROFILE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    setMode('LOGIN');
                  }}
                  className="flex-1 bg-rose-950 hover:bg-rose-900 border border-rose-800/80 text-rose-300 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>LOG OUT</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
