import React, { useState } from 'react';
import { User, AppSettings, PaymentMethod, DepositRequest } from '../types';
import { StorageService } from '../services/storage';
import { 
  X, 
  QrCode, 
  Copy, 
  Check, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface AddBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  settings: AppSettings;
  onSuccess: () => void;
}

export const AddBalanceModal: React.FC<AddBalanceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings,
  onSuccess
}) => {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('50');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [utr, setUtr] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val);
    setCustomAmount(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setAmount(num);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (amount < settings.minDeposit) {
      setError(`Minimum deposit is ${settings.currencySymbol}${settings.minDeposit}`);
      setLoading(false);
      return;
    }

    if (!utr.trim() || utr.trim().length < 6) {
      setError('Please enter a valid 12-digit UTR / Transaction Reference ID from your payment app!');
      setLoading(false);
      return;
    }

    const res = StorageService.createDepositRequest({
      userId: currentUser.id,
      amount,
      utr: utr.trim(),
      paymentMethod,
      screenshotUrl: screenshotUrl || undefined
    });

    setLoading(false);

    if (res.success) {
      setSuccess(res.message);
      setUtr('');
      setScreenshotUrl('');
      onSuccess();
      setTimeout(() => {
        // Keep modal open or let user see pending badge
      }, 1000);
    } else {
      setError(res.message);
    }
  };

  // Get past deposits of this user
  const userDeposits = StorageService.getDeposits().filter(d => d.userId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-white flex items-center gap-2">
                Add Balance to Wallet
              </h3>
              <p className="text-xs text-zinc-400">
                Scan Indian UPI QR Code or pay via UPI Apps & submit 12-digit UTR for instant approval
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

        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Step 1: Admin Payment Details Card */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Step 1: Send Money to Admin
              </span>
              <span className="text-[11px] text-zinc-400">100% Verified Merchant</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 text-center">
                <div className="w-44 h-44 sm:w-48 sm:h-48 p-2 bg-white rounded-xl shadow-md flex items-center justify-center">
                  <img
                    src={settings.qrCodeUrl}
                    alt="Payment QR Code"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback QR code generator if external URL fails
                      (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.upiName)}&am=${amount}&cu=INR`;
                    }}
                  />
                </div>
                <p className="text-xs font-bold text-zinc-200 mt-2">Scan with GPay / PhonePe / Paytm / BHIM</p>
                <p className="text-[11px] text-zinc-400">Scan QR code using any UPI app</p>
              </div>

              {/* UPI Info */}
              <div className="space-y-3">
                {/* UPI Box */}
                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800">
                  <span className="text-[11px] text-zinc-400 font-medium block mb-1">Official Indian UPI ID:</span>
                  <div className="flex items-center justify-between gap-2 bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                    <span className="font-mono text-sm font-bold text-amber-400 select-all truncate">
                      {settings.upiId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-1">Merchant: {settings.upiName}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400">
                  💡 <span className="text-zinc-300 font-semibold">Important:</span> After sending money, copy the 12-digit UTR / Ref No. from your UPI app receipt and submit below.
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Deposit Submission Form */}
          <form onSubmit={handleSubmit} className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4 sm:p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Step 2: Submit Payment Proof
            </span>

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

            {/* Quick Amount Selection */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Select Deposit Amount - Minimum {settings.currencySymbol}{settings.minDeposit}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                {[20, 30, 50, 100, 200, 500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      amount === val
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {settings.currencySymbol}{val}
                  </button>
                ))}
              </div>

              {/* Custom amount field */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  min={settings.minDeposit}
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="Enter custom amount"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Paid Via (Select Indian UPI App)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {(['UPI', 'PhonePe', 'GPay', 'Paytm', 'BHIM'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer truncate ${
                      paymentMethod === method
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* UTR / Transaction ID */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                <span>12-Digit UTR / Transaction ID / Ref No. *</span>
                <span className="text-[10px] text-amber-400 font-normal">Found on receipt</span>
              </label>
              <input
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. 428910293847 or 12 digit UPI ref"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Optional Screenshot Upload */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Upload Payment Screenshot (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 text-xs font-semibold text-zinc-300 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-amber-500" />
                  <span>{screenshotUrl ? 'Screenshot Attached ✓' : 'Choose Receipt Screenshot'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                  />
                </label>
                {screenshotUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-700 flex-shrink-0">
                    <img src={screenshotUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 active:scale-98 transition-transform flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{loading ? 'Submitting...' : `Submit Deposit Request (${settings.currencySymbol}${amount})`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Past Deposit Requests Timeline */}
          {userDeposits.length > 0 && (
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Your Deposit Requests History
              </h4>
              <div className="space-y-2.5">
                {userDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {settings.currencySymbol}{dep.amount}
                        </span>
                        <span className="text-zinc-400 text-[11px]">via {dep.paymentMethod}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        UTR: {dep.utr}
                      </p>
                      {dep.adminNote && (
                        <p className="text-[10px] text-zinc-300 mt-1 italic">
                          Note: {dep.adminNote}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          dep.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : dep.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {dep.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {dep.status === 'pending' && <Clock className="w-3 h-3" />}
                        {dep.status === 'rejected' && <AlertCircle className="w-3 h-3" />}
                        <span className="capitalize">{dep.status}</span>
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {new Date(dep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
