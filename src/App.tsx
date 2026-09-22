import React, { useState, useEffect } from 'react';
import { User, AppSettings, BetChallenge, Tournament } from './types';
import { StorageService } from './services/storage';

// Components
import { Header } from './components/Header';
import { NoticeBanner } from './components/NoticeBanner';
import { BetChallengeSection } from './components/BetChallengeSection';
import { TournamentList } from './components/TournamentList';
import { WalletHistoryView } from './components/WalletHistoryView';
import { AddBalanceModal } from './components/AddBalanceModal';
import { WithdrawModal } from './components/WithdrawModal';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { LiveSupportModal } from './components/LiveSupportModal';

// Icons
import { 
  Gamepad2, 
  Trophy, 
  Wallet, 
  User as UserIcon, 
  Send, 
  Headphones, 
  ShieldCheck, 
  Flame, 
  PlusCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  Phone, 
  MessageCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export const App: React.FC = () => {
  // Global Platform State
  const [currentUser, setCurrentUser] = useState<User | null>(StorageService.getCurrentUser());
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());
  const [bets, setBets] = useState<BetChallenge[]>(StorageService.getBets());
  const [tournaments, setTournaments] = useState<Tournament[]>(StorageService.getTournaments());
  const [allUsers, setAllUsers] = useState<User[]>(StorageService.getUsers());

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<'bets' | 'tournaments' | 'history' | 'profile'>('bets');

  // Modal Control States
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Sync state from StorageService
  const refreshData = () => {
    setCurrentUser(StorageService.getCurrentUser());
    setSettings(StorageService.getSettings());
    setBets(StorageService.getBets());
    setTournaments(StorageService.getTournaments());
    setAllUsers(StorageService.getUsers());
  };

  useEffect(() => {
    // Listen for storage changes across tabs or inside current session
    const unsubscribe = StorageService.subscribe(() => {
      refreshData();
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    StorageService.logoutUser();
    setCurrentUser(null);
    refreshData();
  };

  const handleSwitchUser = (user: User) => {
    StorageService.setCurrentUser(user);
    setCurrentUser(user);
    refreshData();
  };

  const handleOpenAdmin = () => {
    if (StorageService.isAdminLoggedIn()) {
      setIsAdminDashboardOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  // Pending counts for admin alerts in header
  const deposits = StorageService.getDeposits();
  const withdrawals = StorageService.getWithdrawals();
  const pendingDepositsCount = deposits.filter(d => d.status === 'pending').length;
  const pendingBetsCount = bets.filter(b => b.status === 'pending').length;
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'pending').length;

  const telegramUser = (settings.supportTelegram || '@KARANxNXT').replace(/^@/, '');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      
      {/* Top Header Navigation */}
      <Header
        currentUser={currentUser}
        settings={settings}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={handleOpenAdmin}
        onOpenSupport={() => setIsSupportOpen(true)}
        onLogout={handleLogout}
        pendingDepositsCount={pendingDepositsCount}
        pendingBetsCount={pendingBetsCount}
        pendingWithdrawalsCount={pendingWithdrawalsCount}
        onSwitchUser={handleSwitchUser}
        allUsers={allUsers}
      />

      {/* Dynamic Announcement Banner */}
      <NoticeBanner settings={settings} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: 1v1 BET CHALLENGES */}
        {activeTab === 'bets' && (
          <BetChallengeSection
            currentUser={currentUser}
            settings={settings}
            bets={bets}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onRefresh={refreshData}
          />
        )}

        {/* TAB 2: TOURNAMENTS */}
        {activeTab === 'tournaments' && (
          <TournamentList
            currentUser={currentUser}
            settings={settings}
            tournaments={tournaments}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenAuth={() => setIsAuthOpen(true)}
            onRefresh={refreshData}
          />
        )}

        {/* TAB 3: WALLET & PASSBOOK HISTORY */}
        {activeTab === 'history' && (
          <WalletHistoryView
            currentUser={currentUser}
            settings={settings}
            onOpenDeposit={() => setIsDepositOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
          />
        )}

        {/* TAB 4: PLAYER PROFILE */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in">
            {currentUser ? (
              <div className="space-y-6">
                
                {/* Profile Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg">
                      <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-amber-400 font-extrabold text-2xl">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h2 className="text-xl font-heading font-bold text-white">
                          {currentUser.name}
                        </h2>
                        {currentUser.inGameName && (
                          <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-xs text-zinc-300">
                            IGN: {currentUser.inGameName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">
                        Free Fire UID: <strong className="font-mono text-amber-400 font-bold select-all">{currentUser.freeFireUid}</strong>
                      </p>
                      <p className="text-xs text-zinc-400">
                        Phone: <strong className="font-mono text-zinc-200">{currentUser.phone}</strong> • WhatsApp: <strong className="font-mono text-emerald-400">{currentUser.whatsapp}</strong>
                      </p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/40 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Log Out
                    </button>
                  </div>

                  {/* Wallet quick summary */}
                  <div className="mt-6 pt-6 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                      <span className="text-xs text-zinc-400 block">Wallet Balance</span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {settings.currencySymbol}{currentUser.balance}
                      </span>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                      <span className="text-xs text-zinc-400 block">Total Matches Played</span>
                      <span className="text-2xl font-black text-white font-mono">
                        {currentUser.totalMatches}
                      </span>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                      <span className="text-xs text-zinc-400 block">Total Cash Won</span>
                      <span className="text-2xl font-black text-amber-400 font-mono">
                        {settings.currencySymbol}{currentUser.totalWon}
                      </span>
                    </div>
                  </div>

                  {/* Wallet Action Buttons */}
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() => setIsDepositOpen(true)}
                      className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Money to Wallet</span>
                    </button>
                    <button
                      onClick={() => setIsWithdrawOpen(true)}
                      className="flex-1 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ArrowUpRight className="w-4 h-4 text-amber-400" />
                      <span>Request Withdrawal</span>
                    </button>
                  </div>
                </div>

                {/* Direct Telegram Support Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-zinc-900 to-sky-950/40 border border-sky-800/40 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Need Quick Help? Contact Host on Telegram</h4>
                      <p className="text-xs text-zinc-400">Instant answers for room details, deposits, and payouts.</p>
                    </div>
                  </div>
                  <a
                    href={`https://t.me/${telegramUser}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow"
                  >
                    <span>@{telegramUser}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-900 rounded-2xl border border-zinc-800 p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
                  <UserIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-heading font-bold text-white">Player Account Required</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Register or login with your Phone number and Free Fire UID to manage your balance, challenges, and tournament registrations.
                </p>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg cursor-pointer"
                >
                  Login / Register Now
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button for Live Support */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        <a
          href={`https://t.me/${telegramUser}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xl shadow-sky-950/60 border border-sky-400/40 group hover:scale-105 transition-all"
          title="Direct Telegram Chat"
        >
          <Send className="w-4 h-4 fill-white" />
          <span className="hidden sm:inline">Telegram Support</span>
        </a>

        <button
          onClick={() => setIsSupportOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs shadow-xl shadow-amber-950/60 border border-amber-400/40 hover:scale-105 transition-all cursor-pointer"
        >
          <Headphones className="w-4 h-4" />
          <span>Live Support</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950/80 py-6 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="text-zinc-400 font-semibold">Free Fire Clash & Tournament Arena</span>
          </div>
          <p className="text-[11px]">
            Minimum Bet {settings.currencySymbol}{settings.minBet} • Instant Indian UPI Payments • 24x7 Telegram Support: @{telegramUser}
          </p>
          {StorageService.isAdminLoggedIn() && (
            <button
              onClick={handleOpenAdmin}
              className="text-[11px] text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer font-bold"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Dashboard</span>
            </button>
          )}
        </div>
      </footer>

      {/* Modals */}
      <AddBalanceModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        currentUser={currentUser}
        settings={settings}
        onSuccess={refreshData}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        currentUser={currentUser}
        settings={settings}
        onSuccess={refreshData}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          refreshData();
        }}
        onAdminLoginSuccess={() => {
          setIsAdminDashboardOpen(true);
          refreshData();
        }}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => setIsAdminDashboardOpen(true)}
      />

      {isAdminDashboardOpen && (
        <AdminDashboard
          onClose={() => setIsAdminDashboardOpen(false)}
          onLogoutAdmin={() => {
            StorageService.logoutAdmin();
            setIsAdminDashboardOpen(false);
          }}
          settings={settings}
          onRefresh={refreshData}
        />
      )}

      <LiveSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        currentUser={currentUser}
        settings={settings}
        onOpenAuth={() => {
          setIsSupportOpen(false);
          setIsAuthOpen(true);
        }}
      />
    </div>
  );
};

export default App;
