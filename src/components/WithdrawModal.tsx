import React, { useState } from 'react';
import { User, AppSettings, WithdrawalRequest } from '../types';
import { StorageService } from '../services/storage';
import { 
  X, 
  ArrowUpRight, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Building,
  Smartphone
} from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  settings: AppSettings;
  onSuccess: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings,
  onSuccess
}) => {
  const [amount, setAmount] = useState<number>(settings.minWithdrawal);
  const [payoutMethod, setPayoutMethod] = useState<WithdrawalRequest['payoutMethod']>('UPI');
  const [payoutDetails, setPayoutDetails] = useState('');
  const [accountHolder, setAccountHolder] = useState(currentUser?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (amount < settings.minWithdrawal) {
      setError(`Minimum withdrawal amount is ${settings.currencySymbol}${settings.minWithdrawal}`);
      setLoading(false);
      return;
    }

    if (amount > currentUser.balance) {
      setError(`Insufficient wallet balance! Current balance: ${settings.currencySymbol}${currentUser.balance}`);
      setLoading(false);
      return;
    }

    if (!payoutDetails.trim()) {
      setError('Please provide your UPI ID, Phone Number, or Account details to receive money!');
      setLoading(false);
      return;
    }

    const res = StorageService.createWithdrawalRequest({
      userId: currentUser.id,
      amount,
      payoutMethod,
      payoutDetails: payoutDetails.trim(),
      accountHolder: accountHolder.trim() || currentUser.name
    });

    setLoading(false);

    if (res.success) {
      setSuccess(res.message);
      setPayoutDetails('');
      onSuccess();
    } else {
      setError(res.message);
    }
  };

  const userWithdrawals = StorageService.getWithdrawals().filter(w => w.userId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
                Withdraw Funds
              </h3>
              <p className="text-xs text-zinc-400">
                Direct transfer to your Indian UPI, PhonePe, Google Pay, or Paytm
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Current Balance Pill */}
          <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs text-zinc-400 block">Available Wallet Balance:</span>
                <span className="text-lg font-bold text-emerald-400">
                  {settings.currencySymbol}{currentUser.balance}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-zinc-400 block">Min Withdrawal:</span>
              <span className="text-xs font-bold text-amber-400 font-mono">
                {settings.currencySymbol}{settings.minWithdrawal}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* Payout Method */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Payout Method (Indian UPI Options)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(['UPI', 'PhonePe', 'GPay', 'Paytm', 'BHIM'] as WithdrawalRequest['payoutMethod'][]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPayoutMethod(method)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                      payoutMethod === method
                        ? 'bg-amber-500 text-black shadow-md'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Withdrawal Amount */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex justify-between">
                <span>Withdraw Amount ({settings.currencySymbol})</span>
                <span className="text-[11px] text-amber-400">Available: {settings.currencySymbol}{currentUser.balance}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  min={settings.minWithdrawal}
                  max={currentUser.balance}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder={`Min ${settings.currencySymbol}${settings.minWithdrawal}`}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Quick Amount Picks */}
              <div className="flex gap-2 mt-2">
                {[50, 100, 200, 500].filter(v => v <= currentUser.balance).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className="flex-1 py-1 rounded-lg bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300"
                  >
                    {settings.currencySymbol}{preset}
                  </button>
                ))}
                {currentUser.balance >= settings.minWithdrawal && (
                  <button
                    type="button"
                    onClick={() => setAmount(currentUser.balance)}
                    className="py-1 px-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30"
                  >
                    All ({settings.currencySymbol}{currentUser.balance})
                  </button>
                )}
              </div>
            </div>

            {/* Payout Details */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                UPI ID / VPA or UPI Mobile Number *
              </label>
              <input
                type="text"
                value={payoutDetails}
                onChange={(e) => setPayoutDetails(e.target.value)}
                placeholder="e.g. 9876543210@upi or yourname@okaxis"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Account / Beneficiary Name
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Name as per UPI or Bank account"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400">
              ⚡ Withdrawals are processed within 15 to 30 minutes by Admin. If rejected, money will immediately return to your wallet.
            </div>

            <button
              type="submit"
              disabled={loading || currentUser.balance < settings.minWithdrawal}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-98 transition-transform disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing...' : `Request Withdrawal (${settings.currencySymbol}${amount})`}
            </button>
          </form>

          {/* Past Withdrawals */}
          {userWithdrawals.length > 0 && (
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Recent Withdrawal Requests
              </h4>
              <div className="space-y-2.5">
                {userWithdrawals.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {settings.currencySymbol}{item.amount}
                        </span>
                        <span className="text-zinc-400 text-[11px]">to {item.payoutMethod}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {item.payoutDetails} ({item.accountHolder})
                      </p>
                      {item.adminNote && (
                        <p className="text-[10px] text-zinc-300 mt-1 italic">
                          Note: {item.adminNote}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          item.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {item.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status === 'pending' && <Clock className="w-3 h-3" />}
                        {item.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                        <span className="capitalize">{item.status}</span>
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
