import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { User } from '../types';
import { X, UserPlus, LogIn, Phone, Lock, Hash, MessageCircle, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onAdminLoginSuccess?: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onAdminLoginSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Registration fields
  const [name, setName] = useState('');
  const [freeFireUid, setFreeFireUid] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [inGameName, setInGameName] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanPhone = phone.trim();
    const cleanPassword = password.trim();

    if (!cleanPhone || !cleanPassword) {
      setError('Please enter both Phone Number and Password');
      setLoading(false);
      return;
    }

    // Check if logging in as Admin:
    // Requested by user: "PHONE NUMBER Admin Password qwert@0987 debo tokhon admin pannel khulbe"
    if (cleanPhone.toLowerCase() === 'admin') {
      const ok = StorageService.loginAdmin(cleanPassword);
      setLoading(false);
      if (ok) {
        setSuccessMsg('Admin Verified! Opening Admin Control Panel...');
        setTimeout(() => {
          onClose();
          if (onAdminLoginSuccess) {
            onAdminLoginSuccess();
          }
        }, 500);
        return;
      } else {
        setError('Invalid Admin Password! Please enter the correct admin password.');
        return;
      }
    }

    const res = StorageService.loginUser(cleanPhone, cleanPassword);
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 500);
    } else {
      setError(res.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name.trim()) {
      setError('Please enter your Player Name');
      setLoading(false);
      return;
    }

    if (!freeFireUid.trim() || freeFireUid.trim().length < 5) {
      setError('Please enter your valid Free Fire UID (minimum 5 digits)');
      setLoading(false);
      return;
    }

    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit Phone Number');
      setLoading(false);
      return;
    }

    if (!password.trim() || password.length < 4) {
      setError('Password must be at least 4 characters');
      setLoading(false);
      return;
    }

    const res = StorageService.registerUser({
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: (whatsapp.trim() || phone.trim()),
      freeFireUid: freeFireUid.trim(),
      inGameName: inGameName.trim() || name.trim(),
      password: password.trim()
    });

    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 700);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-800 bg-zinc-950">
          <div>
            <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
              <span className="text-amber-500">Free Fire</span> Player Portal
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {mode === 'login' ? 'Login with Phone & Password' : 'New Player Registration with FF UID'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-1">
          <button
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors ${
              mode === 'login'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Player Login
          </button>
          <button
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors ${
              mode === 'register'
                ? 'bg-amber-500 text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            New Registration
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    Phone Number / Login ID
                  </span>
                  <span className="text-[10px] text-zinc-500">10-digit Phone</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-transform cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Login & Enter Arena'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1">
                    <Hash className="w-3 h-3 text-amber-500" />
                    Free Fire UID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 198273645"
                    value={freeFireUid}
                    onChange={(e) => setFreeFireUid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    In-Game Name (IGN)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Killer_07"
                    value={inGameName}
                    onChange={(e) => setInGameName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-amber-500" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="10 digit number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-emerald-500" />
                    WhatsApp No.
                  </label>
                  <input
                    type="tel"
                    placeholder="For Match Room ID"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-500" />
                  Set Password
                </label>
                <input
                  type="password"
                  placeholder="Create your login password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                🔒 Remember your Phone & Password! You will need them to login and access your wallet.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
