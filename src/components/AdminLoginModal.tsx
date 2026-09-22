import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { X, Lock, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ok = StorageService.loginAdmin(password.trim());
    if (ok) {
      onSuccess();
      onClose();
    } else {
      setError('Invalid Admin Password! Please enter the correct master password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-red-900/50 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-400 border border-red-600/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-white">
                Admin Control Portal
              </h3>
              <p className="text-[11px] text-zinc-400">Owner Access Only</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-950/50 border border-red-800/40 text-red-500 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <KeyRound className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-white">Enter Admin Password</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Please enter the master password to access deposits, 1v1 bets, player roster, and withdrawals.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-400" />
                Admin Master Password
              </label>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-red-950/50 active:scale-98 transition-transform cursor-pointer"
            >
              Unlock Admin Panel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
