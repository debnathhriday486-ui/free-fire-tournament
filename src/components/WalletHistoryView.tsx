import React, { useState } from 'react';
import { User, AppSettings, WalletTransaction } from '../types';
import { StorageService } from '../services/storage';
import { 
  History, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Trophy, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  XCircle,
  PlusCircle
} from 'lucide-react';

interface WalletHistoryViewProps {
  currentUser: User | null;
  settings: AppSettings;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const WalletHistoryView: React.FC<WalletHistoryViewProps> = ({
  currentUser,
  settings,
  onOpenDeposit,
  onOpenWithdraw
}) => {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'bets'>('all');

  if (!currentUser) {
    return (
      <div className="text-center py-16 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">Wallet Passbook</h3>
        <p className="text-xs text-zinc-400 mt-1">Please login to view your transaction history.</p>
      </div>
    );
  }

  const transactions = StorageService.getTransactions(currentUser.id);

  const filtered = transactions.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'deposit') return t.type === 'deposit';
    if (filter === 'withdrawal') return t.type === 'withdrawal';
    if (filter === 'bets') return t.type === 'bet_placed' || t.type === 'bet_won' || t.type === 'bet_refund';
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Balance Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Total Wallet Balance</span>
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">
              {settings.currencySymbol}{currentUser.balance}
            </span>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Won {settings.currencySymbol}{currentUser.totalWon} across {currentUser.totalMatches} matches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenDeposit}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Deposit
          </button>
          <button
            onClick={onOpenWithdraw}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" /> Withdraw
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdrawal', label: 'Withdrawals' },
            { id: 'bets', label: '1v1 Bets & Wins' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filter === tab.id
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
          {filtered.length} entries
        </span>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/60 rounded-2xl border border-zinc-800 text-zinc-500 text-xs">
          No transactions found for this filter.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((tx) => {
            const isPositive = tx.amount > 0;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-xs hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'deposit'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : tx.type === 'withdrawal'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : tx.type === 'bet_won'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {tx.type === 'deposit' && <ArrowDownLeft className="w-4 h-4" />}
                    {tx.type === 'withdrawal' && <ArrowUpRight className="w-4 h-4" />}
                    {tx.type === 'bet_won' && <Trophy className="w-4 h-4" />}
                    {tx.type === 'bet_placed' && <RotateCcw className="w-4 h-4" />}
                    {tx.type === 'bet_refund' && <RotateCcw className="w-4 h-4 text-emerald-400" />}
                    {tx.type === 'tournament_entry' && <Trophy className="w-4 h-4" />}
                    {tx.type === 'admin_adjustment' && <Wallet className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block">
                      {tx.title}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-sm font-bold font-mono block ${
                    isPositive ? 'text-emerald-400' : 'text-zinc-200'
                  }`}>
                    {isPositive ? '+' : ''}{settings.currencySymbol}{Math.abs(tx.amount)}
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase ${
                    tx.status === 'completed'
                      ? 'text-emerald-400'
                      : tx.status === 'pending'
                      ? 'text-amber-400'
                      : tx.status === 'refunded'
                      ? 'text-blue-400'
                      : 'text-red-400'
                  }`}>
                    {tx.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                    {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                    {tx.status === 'refunded' && <RotateCcw className="w-3 h-3" />}
                    {tx.status === 'failed' && <XCircle className="w-3 h-3" />}
                    <span>{tx.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
