import React, { useState, useEffect } from 'react';
import { User, AppSettings, BetChallenge, GameMode } from '../types';
import { StorageService } from '../services/storage';
import { 
  Gamepad2, 
  Flame, 
  Trophy, 
  Swords, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  AlertCircle, 
  Sparkles, 
  PlusCircle, 
  XCircle,
  HelpCircle,
  Hash
} from 'lucide-react';

interface BetChallengeSectionProps {
  currentUser: User | null;
  settings: AppSettings;
  bets: BetChallenge[];
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
  onRefresh: () => void;
}

export const BetChallengeSection: React.FC<BetChallengeSectionProps> = ({
  currentUser,
  settings,
  bets,
  onOpenDeposit,
  onOpenAuth,
  onRefresh
}) => {
  const [betAmount, setBetAmount] = useState<number>(30); // Default 30 as in prompt
  const [customBet, setCustomBet] = useState<string>('30');
  const [gameMode, setGameMode] = useState<GameMode>('1v1 Clash Squad');
  const [rules, setRules] = useState<string>('M1887 & Desert Eagle only, Limited Ammo: NO, Gun Attributes: OFF, Skill: OFF');
  const [ffUidInput, setFfUidInput] = useState<string>(currentUser?.freeFireUid || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedRoomId, setCopiedRoomId] = useState<string | null>(null);
  const [copiedRoomPass, setCopiedRoomPass] = useState<string | null>(null);

  // Keep Free Fire UID synced with currentUser
  useEffect(() => {
    if (currentUser?.freeFireUid) {
      setFfUidInput(currentUser.freeFireUid);
    }
  }, [currentUser?.freeFireUid]);

  // Dynamic Payout Calculator based on User Prompt:
  // "30 TAKA BET KORLE 40 TAKA PABE"
  const calculatePayout = (amount: number): number => {
    if (amount === 30) return 40;
    if (amount === 20) return 30;
    if (amount === 50) return 75;
    if (amount === 100) return 150;
    return Math.round(amount * (settings.payoutMultiplierRate || 1.334));
  };

  const currentPayout = calculatePayout(betAmount);

  const handleQuickBet = (val: number) => {
    setBetAmount(val);
    setCustomBet(val.toString());
  };

  const handleCustomBetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomBet(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      setBetAmount(num);
    }
  };

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (betAmount < settings.minBet) {
      setError(`Minimum bet is ${settings.currencySymbol}${settings.minBet}`);
      setLoading(false);
      return;
    }

    if (!currentUser.balance || currentUser.balance < betAmount) {
      setError(`Insufficient balance! You need ${settings.currencySymbol}${betAmount}, but you have ${settings.currencySymbol}${currentUser.balance}. Please Add Balance.`);
      setLoading(false);
      return;
    }

    if (!ffUidInput.trim() || ffUidInput.trim().length < 5) {
      setError('Please provide your valid Free Fire UID before placing the bet!');
      setLoading(false);
      return;
    }

    const res = StorageService.createBetChallenge({
      userId: currentUser.id,
      betAmount,
      gameMode,
      rules,
      freeFireUid: ffUidInput.trim()
    });

    setLoading(false);

    if (res.success) {
      setSuccess(res.message);
      onRefresh();
    } else {
      setError(res.message);
    }
  };

  const handleCopy = (text: string, type: 'id' | 'pass', betId: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedRoomId(betId);
      setTimeout(() => setCopiedRoomId(null), 2000);
    } else {
      setCopiedRoomPass(betId);
      setTimeout(() => setCopiedRoomPass(null), 2000);
    }
  };

  // Filter user's active/past bets
  const userBets = currentUser 
    ? bets.filter(b => b.challengerId === currentUser.id)
    : [];

  return (
    <div className="space-y-8">
      
      {/* Hero Challenge Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-red-950/40 border border-zinc-800 p-5 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-6 opacity-10 hidden lg:block">
          <Flame className="w-48 h-48 text-amber-500 fill-amber-500" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
            <Swords className="w-3.5 h-3.5" />
            <span>1v1 Bet Challenge vs Host</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-heading font-extrabold text-white tracking-wide leading-tight">
            Challenge Host & Win <span className="text-amber-500">Instant Cash!</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 mt-2 font-medium leading-relaxed">
            Play direct 1v1 Free Fire custom room against the host! Minimum bet is only <span className="text-amber-400 font-bold">{settings.currencySymbol}{settings.minBet}</span>. 
            When you win, prize money is instantly credited directly to your wallet!
          </p>

          {/* Quick Rules Pills */}
          <div className="flex flex-wrap gap-2 mt-4 text-xs font-semibold">
            <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
              ⚡ Minimum Bet: {settings.currencySymbol}{settings.minBet}
            </span>
            <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              🏆 Bet {settings.currencySymbol}30 ➔ Win {settings.currencySymbol}40
            </span>
            <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
              🔑 Custom Room ID & Pass Provided by Host
            </span>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              🛡️ 100% Refund if Match Cancelled
            </span>
          </div>
        </div>
      </div>

      {/* Main Challenge Form & Matchmaking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Create 1v1 Challenge */}
        <div className="lg:col-span-7 bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
            <div>
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-amber-500" />
                Place 1v1 Challenge
              </h2>
              <p className="text-xs text-zinc-400">
                Setup your match stakes & room rules against Host
              </p>
            </div>
            {currentUser && (
              <div className="text-right">
                <span className="text-[11px] text-zinc-400 block">Your Balance:</span>
                <span className="text-sm font-bold text-emerald-400">
                  {settings.currencySymbol}{currentUser.balance}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handlePlaceBet} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                {error.includes('Insufficient balance') && (
                  <button
                    type="button"
                    onClick={onOpenDeposit}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold text-xs flex-shrink-0 cursor-pointer"
                  >
                    + Add Balance
                  </button>
                )}
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* Bet Amount Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-zinc-300">
                  Select Bet Amount - Min {settings.currencySymbol}{settings.minBet}
                </label>
                <span className="text-xs font-bold text-amber-400">
                  Win Payout: {settings.currencySymbol}{currentPayout}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {[20, 30, 50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickBet(val)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                      betAmount === val
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-[1.02]'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    <span>{settings.currencySymbol}{val}</span>
                    <span className="text-[10px] opacity-80 mt-0.5">Win {settings.currencySymbol}{calculatePayout(val)}</span>
                  </button>
                ))}
              </div>

              {/* Custom bet input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  min={settings.minBet}
                  value={customBet}
                  onChange={handleCustomBetChange}
                  placeholder="Or enter custom bet amount"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Winning Payout Highlight Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-zinc-950 to-emerald-500/10 border border-amber-500/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-400 block">Payout Guarantee:</span>
                <span className="text-sm font-bold text-white">
                  If you Win, you get <span className="text-emerald-400 text-base">{settings.currencySymbol}{currentPayout}</span>!
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                  Profit
                </span>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  +{settings.currencySymbol}{currentPayout - betAmount}
                </span>
              </div>
            </div>

            {/* Game Mode Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Game Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['1v1 Clash Squad', '1v1 Lone Wolf', '2v2 Clash Squad', '4v4 Clash Squad', 'Custom Room BR'] as GameMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setGameMode(mode)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer truncate ${
                      gameMode === mode
                        ? 'bg-red-600 text-white font-bold shadow'
                        : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Match Rules & Gun Restrictions */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Match Rules & Gun Restrictions
              </label>
              <input
                type="text"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="e.g. Desert Eagle & M1887, No Grenades, Skills OFF"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  'Shotgun + Deagle Only',
                  'Headshot Only',
                  'Unlimited Ammo: YES',
                  'Character Skill: OFF',
                  'Sniper AWM Only'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRules(preset)}
                    className="px-2 py-1 rounded bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Free Fire UID Input for this Match */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-amber-500" />
                  Free Fire UID (Player ID) <span className="text-red-400">*</span>
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">Required for Bet Match</span>
              </label>
              <input
                type="text"
                value={ffUidInput}
                onChange={(e) => setFfUidInput(e.target.value)}
                placeholder="Enter your Free Fire UID (e.g. 198273645)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                required
              />
              <p className="text-[11px] text-zinc-400 mt-1">
                Your Free Fire UID is sent with this bet so Host can verify and invite you to the custom room.
              </p>
            </div>

            {/* Player Info Summary */}
            {currentUser ? (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400 block">Playing as: <strong className="text-white">{currentUser.name}</strong></span>
                  <span className="text-amber-400 font-mono text-[11px]">Free Fire UID: {ffUidInput || currentUser.freeFireUid}</span>
                </div>
                <div className="text-right text-zinc-400 text-[11px]">
                  <span>WhatsApp: {currentUser.whatsapp}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-center text-zinc-400">
                Please login with your Free Fire UID and Phone number to place challenges.
              </div>
            )}

            {/* Submit Button */}
            {currentUser ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20 active:scale-98 transition-transform cursor-pointer flex items-center justify-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>{loading ? 'Sending Request...' : `Send 1v1 Challenge (${settings.currencySymbol}${betAmount})`}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Login to Place 1v1 Bet
              </button>
            )}
          </form>
        </div>

        {/* Right Column: Your Matches & Live Status */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
              <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Your Active & Recent Challenges
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {userBets.length} matches
              </span>
            </div>

            {userBets.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Gamepad2 className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-xs">No match challenges placed yet.</p>
                <p className="text-[11px] text-zinc-400 mt-1">Place a challenge on the left to start playing!</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {userBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 text-xs"
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-white text-sm block">
                          {bet.gameMode}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          Bet: <strong className="text-white">{settings.currencySymbol}{bet.betAmount}</strong> • Win: <strong className="text-emerald-400">{settings.currencySymbol}{bet.winningPayout}</strong>
                        </span>
                      </div>

                      {/* Status badge */}
                      <div>
                        {bet.status === 'pending' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                            <Clock className="w-3 h-3" />
                            Pending Host
                          </span>
                        )}
                        {bet.status === 'accepted' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Accepted! Room Ready
                          </span>
                        )}
                        {bet.status === 'completed' && (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                            bet.winner === 'player'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}>
                            <Trophy className="w-3 h-3" />
                            {bet.winner === 'player' ? 'YOU WON!' : 'Host Won'}
                          </span>
                        )}
                        {bet.status === 'cancelled' && (
                          <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Cancelled & Refunded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Rules note */}
                    <div className="p-2 rounded-lg bg-zinc-900 text-[11px] text-zinc-300 border border-zinc-800/60">
                      <span className="text-zinc-400 font-semibold">Rules:</span> {bet.rules}
                    </div>

                    {/* If accepted: Show Room ID and Password */}
                    {bet.status === 'accepted' && bet.roomId && (
                      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-zinc-900 border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                          <span>🔑 ROOM CREDENTIALS (CUSTOM ROOM DETAILS):</span>
                          <span>Join in Free Fire</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Room ID Box */}
                          <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-zinc-400 block">Room ID:</span>
                              <span className="font-mono text-sm font-bold text-white select-all">
                                {bet.roomId}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(bet.roomId!, 'id', bet.id)}
                              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                            >
                              {copiedRoomId === bet.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Room Password Box */}
                          <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-zinc-400 block">Password:</span>
                              <span className="font-mono text-sm font-bold text-amber-400 select-all">
                                {bet.roomPassword || 'None'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(bet.roomPassword || '', 'pass', bet.id)}
                              className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs"
                            >
                              {copiedRoomPass === bet.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <p className="text-[10px] text-zinc-400 text-center">
                          ⚡ Open Free Fire ➔ Custom ➔ Search Room ID ➔ Enter Password
                        </p>
                      </div>
                    )}

                    {/* Result notes */}
                    {bet.adminNote && (
                      <p className="text-[11px] text-zinc-300 italic">
                        Result: {bet.adminNote}
                      </p>
                    )}

                    <div className="text-[10px] text-zinc-400 flex justify-between pt-1 border-t border-zinc-900">
                      <span>Ref: #{bet.id.slice(-6)}</span>
                      <span>{new Date(bet.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Guidance Box */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
            <h4 className="font-bold text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> How 1v1 Betting Works:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>Select your bet amount (Minimum {settings.currencySymbol}{settings.minBet}) and send your match challenge.</li>
              <li>Host reviews the request in the Admin Panel and sends the Custom Room ID & Password.</li>
              <li>Open Free Fire, enter Custom Room mode, search the Room ID, and enter the Password to join.</li>
              <li>After the match ends, Host verifies the winner and cash prize is immediately credited to your wallet!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
