import React, { useState } from 'react';
import { User, AppSettings } from '../types';
import { StorageService } from '../services/storage';
import { 
  Flame, 
  Wallet, 
  PlusCircle, 
  ArrowUpRight, 
  ShieldCheck, 
  LogOut, 
  User as UserIcon, 
  Gamepad2, 
  Trophy, 
  History, 
  Bell,
  Menu,
  X,
  PhoneCall,
  CheckCircle2,
  Headphones,
  Send
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  settings: AppSettings;
  activeTab: 'bets' | 'tournaments' | 'history' | 'profile';
  setActiveTab: (tab: 'bets' | 'tournaments' | 'history' | 'profile') => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  pendingDepositsCount: number;
  pendingBetsCount: number;
  pendingWithdrawalsCount: number;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  settings,
  activeTab,
  setActiveTab,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenAuth,
  onOpenAdmin,
  onOpenSupport,
  onLogout,
  pendingDepositsCount,
  pendingBetsCount,
  pendingWithdrawalsCount,
  onSwitchUser,
  allUsers
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const totalAdminPending = pendingDepositsCount + pendingBetsCount + pendingWithdrawalsCount;

  return (
    <header id="app_header" className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('bets')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 p-0.5 shadow-lg shadow-orange-950/50 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-lg sm:text-xl font-bold tracking-wider text-white">
                    FF <span className="text-amber-500">CLASH</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                    ARENA
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 -mt-0.5 font-medium hidden sm:block">
                  Free Fire 1v1 Challenge & Tournament
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/70 p-1 rounded-xl border border-zinc-800">
            <button
              id="nav_1v1_tab"
              onClick={() => setActiveTab('bets')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'bets'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              1v1 Challenge
            </button>
            <button
              id="nav_tournaments_tab"
              onClick={() => setActiveTab('tournaments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'tournaments'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Tournaments
            </button>
            <button
              id="nav_history_tab"
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              Passbook
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Wallet Balance Widget (if user logged in) */}
            {currentUser ? (
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 sm:p-1.5 shadow-inner">
                <div className="flex items-center gap-1.5 px-2.5 py-1">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-zinc-400 hidden sm:inline">Wallet:</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {settings.currencySymbol}{currentUser.balance}
                  </span>
                </div>
                
                {/* Quick Add Balance Button */}
                <button
                  id="btn_add_balance_header"
                  onClick={onOpenDeposit}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors cursor-pointer"
                  title="Deposit money to wallet"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Deposit</span>
                </button>

                {/* Quick Withdraw Button */}
                <button
                  id="btn_withdraw_header"
                  onClick={onOpenWithdraw}
                  className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer ml-1"
                  title="Withdraw winnings"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Withdraw</span>
                </button>
              </div>
            ) : (
              <button
                id="btn_header_login"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm transition-transform active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login / Register</span>
              </button>
            )}

            {/* Live Support Button */}
            <button
              id="btn_open_support_header"
              onClick={onOpenSupport}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-700/50 text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Live Support & Telegram"
            >
              <Headphones className="w-4 h-4 text-sky-400" />
              <span className="hidden sm:inline">Support</span>
            </button>

            {/* Admin Panel Entry Button - Only visible once Host logs in with Admin credentials */}
            {StorageService.isAdminLoggedIn() && (
              <button
                id="btn_open_admin_panel"
                onClick={onOpenAdmin}
                className="relative flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-700/50 text-xs font-bold transition-all shadow-sm cursor-pointer group"
                title="Admin Control Panel"
              >
                <ShieldCheck className="w-4 h-4 text-red-400 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
                
                {totalAdminPending > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-bounce shadow-md">
                    {totalAdminPending}
                  </span>
                )}
              </button>
            )}

            {/* User Profile Menu */}
            {currentUser && (
              <div className="relative">
                <button
                  id="btn_user_profile_dropdown"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-black font-bold text-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-white text-xs font-bold leading-tight truncate max-w-[90px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-amber-400 font-mono leading-none">
                      UID: {currentUser.freeFireUid}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-zinc-950 rounded-xl mb-2 border border-zinc-800/80">
                      <p className="text-sm font-bold text-white">{currentUser.name}</p>
                      <p className="text-xs text-amber-400 font-mono">FF UID: {currentUser.freeFireUid}</p>
                      <p className="text-xs text-zinc-400 mt-1">Phone: {currentUser.phone}</p>
                      <div className="mt-2 pt-2 border-t border-zinc-800 flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Wallet:</span>
                        <span className="font-bold text-emerald-400 text-sm">
                          {settings.currencySymbol}{currentUser.balance}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-zinc-800 space-y-1">
                      <button
                        onClick={() => {
                          onOpenDeposit();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Balance (Deposit)
                      </button>
                      <button
                        onClick={() => {
                          onOpenWithdraw();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4 text-amber-400" />
                        Withdraw Money
                      </button>
                      <button
                        onClick={() => {
                          onLogout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-zinc-800 space-y-2 animate-in fade-in">
            <button
              onClick={() => {
                setActiveTab('bets');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                activeTab === 'bets' ? 'bg-amber-500 text-black' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Gamepad2 className="w-5 h-5" />
              1v1 Custom Challenge
            </button>
            <button
              onClick={() => {
                setActiveTab('tournaments');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                activeTab === 'tournaments' ? 'bg-amber-500 text-black' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <Trophy className="w-5 h-5" />
              Tournaments
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold ${
                activeTab === 'history' ? 'bg-amber-500 text-black' : 'text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              <History className="w-5 h-5" />
              Wallet Passbook & History
            </button>
            <button
              onClick={() => {
                onOpenSupport();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-950/30 text-sky-300 border border-sky-800/40 hover:bg-sky-900/40"
            >
              <div className="flex items-center gap-3">
                <Headphones className="w-5 h-5 text-sky-400" />
                <span>Live Support & Telegram</span>
              </div>
              <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full font-bold">24/7</span>
            </button>

            {currentUser && (
              <div className="pt-2 border-t border-zinc-800 flex gap-2">
                <button
                  onClick={() => {
                    onOpenDeposit();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 flex items-center justify-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" /> Deposit
                </button>
                <button
                  onClick={() => {
                    onOpenWithdraw();
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-zinc-900 text-zinc-300 font-bold text-xs border border-zinc-800 flex items-center justify-center gap-1"
                >
                  <ArrowUpRight className="w-4 h-4 text-amber-400" /> Withdraw
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
