import React, { useState } from 'react';
import { User, AppSettings, Tournament } from '../types';
import { StorageService } from '../services/storage';
import { 
  Trophy, 
  Users, 
  MapPin, 
  Calendar, 
  Coins, 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Crosshair,
  Flame
} from 'lucide-react';

interface TournamentListProps {
  currentUser: User | null;
  settings: AppSettings;
  tournaments: Tournament[];
  onOpenDeposit: () => void;
  onOpenAuth: () => void;
  onRefresh: () => void;
}

export const TournamentList: React.FC<TournamentListProps> = ({
  currentUser,
  settings,
  tournaments,
  onOpenDeposit,
  onOpenAuth,
  onRefresh
}) => {
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPass, setCopiedPass] = useState<string | null>(null);

  const handleJoin = (t: Tournament) => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (currentUser.balance < t.entryFee) {
      setError(`Insufficient balance! You need ${settings.currencySymbol}${t.entryFee}, but have ${settings.currencySymbol}${currentUser.balance}.`);
      setLoading(false);
      return;
    }

    const res = StorageService.joinTournament(t.id, currentUser.id);
    setLoading(false);

    if (res.success) {
      setSuccess(res.message);
      onRefresh();
    } else {
      setError(res.message);
    }
  };

  const handleCopy = (text: string, type: 'id' | 'pass', tourneyId: string) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(tourneyId);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedPass(tourneyId);
      setTimeout(() => setCopiedPass(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900 border border-zinc-800">
        <div>
          <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Free Fire Esports Tournaments
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Join custom tournaments, survive to the end, get kills and take home massive prize pools!
          </p>
        </div>
        {currentUser && (
          <div className="flex items-center gap-3 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-400">Available:</span>
            <span className="text-sm font-bold text-emerald-400">
              {settings.currencySymbol}{currentUser.balance}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          {error.includes('Insufficient balance') && (
            <button
              onClick={onOpenDeposit}
              className="px-2.5 py-1 rounded bg-emerald-500 text-black font-bold text-xs cursor-pointer"
            >
              Deposit Funds
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

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tournaments.map((t) => {
          const isUserJoined = currentUser && t.participants.some(p => p.userId === currentUser.id);
          const percentFilled = Math.round((t.slotsFilled / t.slotsTotal) * 100);
          const isFull = t.slotsFilled >= t.slotsTotal;

          return (
            <div
              key={t.id}
              className="bg-zinc-900/90 rounded-2xl border border-zinc-800 p-5 space-y-4 shadow-xl hover:border-zinc-700 transition-colors"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                      {t.gameMode}
                    </span>
                    <span className="text-zinc-400 text-xs flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" /> {t.map}
                    </span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white mt-1">
                    {t.title}
                  </h3>
                </div>

                {/* Status pill */}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  t.status === 'upcoming' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : t.status === 'ongoing'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {t.status}
                </span>
              </div>

              {/* Prize & Entry stats */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800/80 text-center">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Total Pool</span>
                  <span className="text-sm font-bold text-amber-400 font-mono">
                    {settings.currencySymbol}{t.prizePool}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">1st Prize</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">
                    {settings.currencySymbol}{t.firstPrize}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Entry Fee</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {settings.currencySymbol}{t.entryFee}
                  </span>
                </div>
              </div>

              {/* Slots progress */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-zinc-400" /> Slots Filled:
                  </span>
                  <span className="font-bold text-white">
                    {t.slotsFilled} / {t.slotsTotal} ({percentFilled}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all"
                    style={{ width: `${percentFilled}%` }}
                  />
                </div>
              </div>

              {/* Schedule time */}
              <div className="flex items-center gap-2 text-xs text-zinc-300">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Match Schedule: <strong className="text-white">{t.scheduleTime}</strong></span>
              </div>

              {/* Room details if joined */}
              {isUserJoined && t.roomId ? (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Unlock className="w-3.5 h-3.5" /> ROOM DETAILS UNLOCKED
                    </span>
                    <span>Ready in Free Fire</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Room ID:</span>
                        <span className="font-mono text-sm font-bold text-white">{t.roomId}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(t.roomId!, 'id', t.id)}
                        className="p-1 rounded bg-zinc-800 text-zinc-300"
                      >
                        {copiedId === t.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 block">Password:</span>
                        <span className="font-mono text-sm font-bold text-amber-400">{t.roomPass || 'Open'}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(t.roomPass || '', 'pass', t.id)}
                        className="p-1 rounded bg-zinc-800 text-zinc-300"
                      >
                        {copiedPass === t.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : isUserJoined ? (
                <div className="p-2.5 bg-blue-950/40 border border-blue-800/50 rounded-xl text-[11px] text-blue-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-blue-400" />
                  <span>You are Registered! Room ID & Password will appear here 15 mins before match.</span>
                </div>
              ) : null}

              {/* Action Button */}
              {isUserJoined ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Already Registered
                </button>
              ) : isFull ? (
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-zinc-800 text-zinc-500 font-bold text-xs"
                >
                  Slots Full
                </button>
              ) : (
                <button
                  onClick={() => handleJoin(t)}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/20 active:scale-98 transition-transform cursor-pointer flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  <span>Join Tournament ({settings.currencySymbol}{t.entryFee})</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
