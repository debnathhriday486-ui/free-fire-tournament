import React, { useState, useEffect } from 'react';
import { 
  User, 
  DepositRequest, 
  WithdrawalRequest, 
  BetChallenge, 
  Tournament, 
  AppSettings,
  SupportThread 
} from '../types';
import { StorageService } from '../services/storage';
import { 
  ShieldCheck, 
  Users, 
  CreditCard, 
  Gamepad2, 
  ArrowUpRight, 
  Trophy, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  MessageCircle, 
  Wallet, 
  PlusCircle, 
  MinusCircle, 
  Trash2, 
  LogOut, 
  AlertCircle, 
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  KeyRound,
  RotateCcw,
  MessageSquare,
  Send,
  Upload,
  Image as ImageIcon,
  Headphones,
  User as UserIcon
} from 'lucide-react';

interface AdminDashboardProps {
  onClose: () => void;
  onLogoutAdmin: () => void;
  settings: AppSettings;
  onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onClose,
  onLogoutAdmin,
  settings,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'deposits' | 'bets' | 'withdrawals' | 'players' | 'tournaments' | 'support' | 'settings'>('deposits');

  // Data state
  const [deposits, setDeposits] = useState<DepositRequest[]>(StorageService.getDeposits());
  const [bets, setBets] = useState<BetChallenge[]>(StorageService.getBets());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(StorageService.getWithdrawals());
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [tournaments, setTournaments] = useState<Tournament[]>(StorageService.getTournaments());
  const [currentSettings, setCurrentSettings] = useState<AppSettings>(settings);
  const [supportThreads, setSupportThreads] = useState<SupportThread[]>(StorageService.getSupportThreads());

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');

  // Modals & form state
  const [acceptingBet, setAcceptingBet] = useState<BetChallenge | null>(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPassInput, setRoomPassInput] = useState('');

  // User balance adjustment modal
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustMode, setAdjustMode] = useState<'add' | 'deduct'>('deduct');
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustNote, setAdjustNote] = useState('Penalty / Match Loss / Deduction');

  // Create tournament form
  const [newTourneyTitle, setNewTourneyTitle] = useState('');
  const [newTourneyMode, setNewTourneyMode] = useState('4v4 Clash Squad');
  const [newTourneyMap, setNewTourneyMap] = useState('Bermuda');
  const [newTourneyEntry, setNewTourneyEntry] = useState(30);
  const [newTourneyPrize, setNewTourneyPrize] = useState(500);
  const [newTourneyFirst, setNewTourneyFirst] = useState(350);
  const [newTourneySlots, setNewTourneySlots] = useState(16);
  const [newTourneySchedule, setNewTourneySchedule] = useState('Today at 09:00 PM');
  const [newTourneyRoomId, setNewTourneyRoomId] = useState('');
  const [newTourneyRoomPass, setNewTourneyRoomPass] = useState('');

  // Settings form
  const [settingsForm, setSettingsForm] = useState<AppSettings>(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Status message
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const reloadData = () => {
    setDeposits(StorageService.getDeposits());
    setBets(StorageService.getBets());
    setWithdrawals(StorageService.getWithdrawals());
    setUsers(StorageService.getUsers());
    setTournaments(StorageService.getTournaments());
    setCurrentSettings(StorageService.getSettings());
    setSupportThreads(StorageService.getSupportThreads());
    onRefresh();
  };

  useEffect(() => {
    const unsub = StorageService.subscribe((topic) => {
      if (topic === 'support' || topic === 'all' || topic === 'settings') {
        setSupportThreads(StorageService.getSupportThreads());
        setCurrentSettings(StorageService.getSettings());
      }
    });
    return unsub;
  }, []);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Support Chat Actions
  const handleSelectSupportThread = (thread: SupportThread) => {
    setActiveThreadId(thread.id);
    StorageService.markThreadReadByAdmin(thread.id);
    setSupportThreads(StorageService.getSupportThreads());
  };

  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadId || !adminReplyText.trim()) return;
    StorageService.sendAdminReply(activeThreadId, adminReplyText.trim());
    setAdminReplyText('');
    setSupportThreads(StorageService.getSupportThreads());
    showNotice('success', 'Reply sent directly to player!');
  };

  const handleSendQuickReply = (text: string) => {
    if (!activeThreadId) return;
    StorageService.sendAdminReply(activeThreadId, text);
    setSupportThreads(StorageService.getSupportThreads());
    showNotice('success', 'Quick response sent!');
  };

  const handleDeleteSupportThread = (threadId: string) => {
    if (window.confirm('Delete this support conversation?')) {
      StorageService.deleteSupportThread(threadId);
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
      }
      setSupportThreads(StorageService.getSupportThreads());
      showNotice('success', 'Conversation removed.');
    }
  };

  // QR Code Upload from File
  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showNotice('error', 'Please choose an image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setSettingsForm(prev => ({ ...prev, qrCodeUrl: base64 }));
        showNotice('success', 'QR Scanner image loaded! Click "Save & Apply Settings" below to activate.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate UPI QR automatically from UPI ID
  const handleGenerateDynamicQr = () => {
    const upi = (settingsForm.upiId || '8422001511@fam').trim();
    const name = encodeURIComponent(settingsForm.upiName || 'Karan Esports');
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`upi://pay?pa=${upi}&pn=${name}&cu=INR`)}`;
    setSettingsForm(prev => ({ ...prev, qrCodeUrl: url }));
    showNotice('success', `Dynamic QR generated for ${upi}! Click Save Settings to apply.`);
  };

  // Deposit Actions
  const handleApproveDeposit = (depositId: string) => {
    const ok = StorageService.approveDeposit(depositId);
    if (ok) {
      showNotice('success', 'Deposit approved! Funds added to player wallet.');
      reloadData();
    } else {
      showNotice('error', 'Failed to approve deposit.');
    }
  };

  const handleRejectDeposit = (depositId: string) => {
    const reason = window.prompt('Enter rejection reason for player:', 'Invalid UTR or Payment not received') || 'Payment verification failed';
    const ok = StorageService.rejectDeposit(depositId, reason);
    if (ok) {
      showNotice('success', 'Deposit request rejected.');
      reloadData();
    }
  };

  // Bet Actions
  const handleOpenAcceptBet = (bet: BetChallenge) => {
    setAcceptingBet(bet);
    setRoomIdInput(Math.floor(1000000 + Math.random() * 9000000).toString());
    setRoomPassInput(Math.floor(100 + Math.random() * 900).toString());
  };

  const handleConfirmAcceptBet = () => {
    if (!acceptingBet || !roomIdInput.trim()) return;
    const ok = StorageService.acceptBetChallenge(acceptingBet.id, roomIdInput, roomPassInput);
    if (ok) {
      showNotice('success', `Bet accepted! Room ID ${roomIdInput} sent to player.`);
      setAcceptingBet(null);
      reloadData();
    }
  };

  const handleDeclareWinner = (betId: string, winner: 'player' | 'admin') => {
    const ok = StorageService.declareBetWinner(betId, winner);
    if (ok) {
      if (winner === 'player') {
        showNotice('success', 'Declared Player as Winner! Prize money automatically credited to player wallet.');
      } else {
        showNotice('success', 'Declared Admin/Host as Winner! Bet settled.');
      }
      reloadData();
    }
  };

  const handleCancelBet = (betId: string) => {
    const reason = window.prompt('Reason for match cancellation:', 'Host cancelled the match. Bet refunded in full.') || 'Match cancelled by Admin';
    const ok = StorageService.cancelBetChallenge(betId, reason);
    if (ok) {
      showNotice('success', 'Match cancelled! 100% of the bet was refunded to player wallet.');
      reloadData();
    }
  };

  // Withdrawal Actions
  const handleApproveWithdrawal = (id: string) => {
    const ok = StorageService.completeWithdrawal(id, 'Payment processed via UPI/Bank');
    if (ok) {
      showNotice('success', 'Withdrawal marked as completed/paid.');
      reloadData();
    }
  };

  const handleRejectWithdrawal = (id: string) => {
    const reason = window.prompt('Reason for withdrawal rejection (Funds will be refunded to user):', 'Invalid UPI ID / Account detail') || 'Payment could not be completed';
    const ok = StorageService.rejectWithdrawal(id, reason);
    if (ok) {
      showNotice('success', 'Withdrawal rejected and amount refunded back to player wallet.');
      reloadData();
    }
  };

  // User Actions
  const handleBalanceAdjust = () => {
    if (!adjustingUser) return;
    if (adjustAmount <= 0) {
      showNotice('error', 'Please enter a valid amount greater than 0.');
      return;
    }

    const finalAmount = adjustMode === 'deduct' ? -Math.abs(adjustAmount) : Math.abs(adjustAmount);
    const defaultNote = adjustMode === 'deduct' 
      ? `Admin Deduction: -${currentSettings.currencySymbol}${adjustAmount}` 
      : `Admin Credit: +${currentSettings.currencySymbol}${adjustAmount}`;

    const ok = StorageService.adjustUserBalance(adjustingUser.id, finalAmount, adjustNote.trim() || defaultNote);
    if (ok) {
      showNotice(
        'success', 
        adjustMode === 'deduct'
          ? `Deducted ${currentSettings.currencySymbol}${adjustAmount} from ${adjustingUser.name}'s wallet successfully!`
          : `Added ${currentSettings.currencySymbol}${adjustAmount} to ${adjustingUser.name}'s wallet successfully!`
      );
      setAdjustingUser(null);
      reloadData();
      onRefresh();
    }
  };

  const handleToggleBlock = (u: User) => {
    const updatedStatus = u.status === 'active' ? 'blocked' : 'active';
    StorageService.updateUser({ ...u, status: updatedStatus });
    showNotice('success', `Player ${u.name} is now ${updatedStatus}.`);
    reloadData();
  };

  const handleDeleteUser = (u: User) => {
    if (window.confirm(`Are you sure you want to permanently delete player "${u.name}" (UID: ${u.freeFireUid})?`)) {
      StorageService.deleteUser(u.id);
      showNotice('success', `Player ${u.name} deleted successfully.`);
      reloadData();
      onRefresh();
    }
  };

  const handleClearDemoPlayers = () => {
    if (window.confirm('Delete all demo players and associated demo records?')) {
      StorageService.clearAllDemoPlayers();
      showNotice('success', 'All demo players removed successfully.');
      reloadData();
      onRefresh();
    }
  };

  const handleDeleteAllPlayers = () => {
    if (window.confirm('Are you sure you want to delete ALL player accounts and clear the player database? This cannot be undone.')) {
      StorageService.deleteAllPlayers();
      showNotice('success', 'All player accounts deleted.');
      reloadData();
      onRefresh();
    }
  };

  // Tournament Action
  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourneyTitle.trim()) return;

    StorageService.createTournament({
      title: newTourneyTitle.trim(),
      gameMode: newTourneyMode,
      map: newTourneyMap,
      entryFee: newTourneyEntry,
      prizePool: newTourneyPrize,
      firstPrize: newTourneyFirst,
      perKillPrize: 10,
      slotsTotal: newTourneySlots,
      scheduleTime: newTourneySchedule.trim(),
      status: 'upcoming',
      roomId: newTourneyRoomId.trim() || undefined,
      roomPass: newTourneyRoomPass.trim() || undefined,
    });

    showNotice('success', 'New tournament created successfully!');
    setNewTourneyTitle('');
    reloadData();
  };

  const handleDeleteTournament = (t: Tournament) => {
    const hasParticipants = t.participants && t.participants.length > 0;
    const confirmMsg = hasParticipants 
      ? `Are you sure you want to delete/cancel tournament "${t.title}"?\n\nIt has ${t.participants.length} registered player(s). Their entry fee (${currentSettings.currencySymbol}${t.entryFee} each) will be AUTOMATICALLY refunded to their wallets!`
      : `Are you sure you want to delete tournament "${t.title}"?`;

    if (window.confirm(confirmMsg)) {
      const res = StorageService.deleteTournament(t.id, true);
      if (res.success) {
        showNotice('success', res.message);
        reloadData();
        onRefresh();
      } else {
        showNotice('error', res.message);
      }
    }
  };

  const handleUpdateTournamentStatus = (t: Tournament, status: Tournament['status']) => {
    StorageService.updateTournament({ ...t, status });
    showNotice('success', `Tournament "${t.title}" status updated to ${status}.`);
    reloadData();
    onRefresh();
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateSettings(settingsForm);
    setSettingsSaved(true);
    showNotice('success', 'Settings updated successfully!');
    setTimeout(() => setSettingsSaved(false), 3000);
    reloadData();
  };

  // Counts
  const pendingDeposits = deposits.filter(d => d.status === 'pending');
  const pendingBets = bets.filter(b => b.status === 'pending');
  const activeBets = bets.filter(b => b.status === 'accepted');
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const unreadSupportCount = supportThreads.reduce((sum, t) => sum + (t.unreadByAdmin || 0), 0);
  const totalBalanceInCirculation = users.reduce((acc, u) => acc + u.balance, 0);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden animate-in fade-in">
      
      {/* Top Admin Header */}
      <header className="bg-zinc-900 border-b border-red-900/40 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 border border-red-600/40 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-heading font-extrabold text-white">
                Admin Control Panel
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-600/50">
                MASTER ACCESS
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Free Fire Arena Management & Match Approvals
            </p>
          </div>
        </div>

        {/* Right Admin Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
          >
            Switch to Player View
          </button>
          <button
            onClick={() => {
              onLogoutAdmin();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/40 text-xs font-bold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Admin</span>
          </button>
        </div>
      </header>

      {/* Global Feedback Banner */}
      {feedback && (
        <div className={`py-2 px-4 text-xs text-center font-bold flex items-center justify-center gap-2 transition-all ${
          feedback.type === 'success' ? 'bg-emerald-600 text-black' : 'bg-red-600 text-white'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Admin Stats Overview Bar */}
      <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-4 sm:px-6 py-2.5 flex-shrink-0 overflow-x-auto">
        <div className="flex items-center gap-4 text-xs min-w-max">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 rounded-lg border border-zinc-800">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-zinc-400">Total Players:</span>
            <span className="font-bold text-white">{users.length}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 rounded-lg border border-zinc-800">
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-400">Pending Deposits:</span>
            <span className={`font-bold ${pendingDeposits.length > 0 ? 'text-amber-400 font-extrabold' : 'text-white'}`}>
              {pendingDeposits.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 rounded-lg border border-zinc-800">
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">1v1 Bet Requests:</span>
            <span className={`font-bold ${pendingBets.length > 0 ? 'text-amber-400 font-extrabold' : 'text-white'}`}>
              {pendingBets.length} pending / {activeBets.length} live
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 rounded-lg border border-zinc-800">
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-zinc-400">Pending Withdrawals:</span>
            <span className={`font-bold ${pendingWithdrawals.length > 0 ? 'text-amber-400 font-extrabold' : 'text-white'}`}>
              {pendingWithdrawals.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 rounded-lg border border-zinc-800">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-400">User Wallet Total:</span>
            <span className="font-bold text-emerald-400">{currentSettings.currencySymbol}{totalBalanceInCirculation}</span>
          </div>
        </div>
      </div>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Vertical Sidebar Tabs */}
        <aside className="w-52 sm:w-60 bg-zinc-950 border-r border-zinc-800 p-3 flex flex-col gap-1 flex-shrink-0 overflow-y-auto">
          
          <button
            onClick={() => setActiveTab('deposits')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'deposits'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4" />
              <span>Deposits</span>
            </div>
            {pendingDeposits.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'deposits' ? 'bg-black text-amber-400' : 'bg-red-600 text-white animate-pulse'
              }`}>
                {pendingDeposits.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bets')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'bets'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Gamepad2 className="w-4 h-4" />
              <span>1v1 Bets & Matches</span>
            </div>
            {pendingBets.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'bets' ? 'bg-black text-amber-400' : 'bg-red-600 text-white animate-pulse'
              }`}>
                {pendingBets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdrawals</span>
            </div>
            {pendingWithdrawals.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'withdrawals' ? 'bg-black text-amber-400' : 'bg-red-600 text-white animate-pulse'
              }`}>
                {pendingWithdrawals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'players'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Registered Players</span>
            </div>
            <span className="text-[10px] opacity-70">({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tournaments')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'tournaments'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Trophy className="w-4 h-4" />
              <span>Tournaments</span>
            </div>
            <span className="text-[10px] opacity-70">({tournaments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'support'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              <span>Live Support Chat</span>
            </div>
            {unreadSupportCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'support' ? 'bg-black text-amber-400' : 'bg-sky-500 text-white animate-pulse'
              }`}>
                {unreadSupportCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <SettingsIcon className="w-4 h-4" />
              <span>UPI & QR Settings</span>
            </div>
          </button>

          {/* System Status box */}
          <div className="mt-auto p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
            <span className="text-white font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Admin Access Active
            </span>
            <p className="text-[10px] text-zinc-400">Live Indian UPI sync & instant room matchmaking.</p>
          </div>
        </aside>

        {/* Right Content View */}
        <main className="flex-1 bg-zinc-900/40 p-4 sm:p-6 overflow-y-auto">
          
          {/* TAB 1: DEPOSITS APPROVAL */}
          {activeTab === 'deposits' && (
            <div className="space-y-4 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    Deposit & Add Balance Requests
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Verify UTR & Payment proofs. On approval, money automatically credits to player's wallet.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 self-start sm:self-auto">
                  {pendingDeposits.length} Pending Approval
                </span>
              </div>

              {deposits.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-500 text-xs">
                  No deposit requests yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {deposits.map((dep) => (
                    <div
                      key={dep.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        dep.status === 'pending'
                          ? 'bg-zinc-950 border-amber-500/40 shadow-lg shadow-amber-950/10'
                          : 'bg-zinc-950/60 border-zinc-800/80 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Player & Amount Info */}
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base font-bold text-white">{dep.userName}</span>
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs text-amber-400">
                              UID: {dep.freeFireUid}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              dep.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : dep.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            }`}>
                              {dep.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                            <span>Phone: <strong className="text-zinc-200">{dep.userPhone}</strong></span>
                            {dep.userWhatsapp && (
                              <a
                                href={`https://wa.me/${dep.userWhatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp
                              </a>
                            )}
                            <span>Time: {new Date(dep.createdAt).toLocaleString()}</span>
                          </div>

                          {/* UTR and Payment Details */}
                          <div className="pt-2 flex flex-wrap items-center gap-3">
                            <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                              <span className="text-zinc-400">UTR / Ref: </span>
                              <strong className="font-mono text-amber-300 select-all">{dep.utr}</strong>
                            </div>
                            <div className="px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                              <span className="text-zinc-400">Method: </span>
                              <strong className="text-white">{dep.paymentMethod}</strong>
                            </div>
                            {dep.screenshotUrl && (
                              <a
                                href={dep.screenshotUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1"
                              >
                                <span>View Receipt Screenshot</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          {dep.adminNote && (
                            <p className="text-xs text-zinc-400 italic mt-1">
                              Admin Note: {dep.adminNote}
                            </p>
                          )}
                        </div>

                        {/* Amount & Action Buttons */}
                        <div className="flex flex-row md:flex-col items-end justify-between gap-3 flex-shrink-0">
                          <div className="text-right">
                            <span className="text-xs text-zinc-400 block">Requested Amount</span>
                            <span className="text-2xl font-black text-emerald-400 font-mono">
                              {currentSettings.currencySymbol}{dep.amount}
                            </span>
                          </div>

                          {dep.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveDeposit(dep.id)}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approve & Add Balance</span>
                              </button>
                              <button
                                onClick={() => handleRejectDeposit(dep.id)}
                                className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/40 font-bold text-xs cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 italic">
                              Processed on {dep.processedAt ? new Date(dep.processedAt).toLocaleTimeString() : 'N/A'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 1v1 BETS & MATCHES */}
          {activeTab === 'bets' && (
            <div className="space-y-4 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-amber-500" />
                    1v1 Bets & Challenges vs Host
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Accept player challenges, dispatch Free Fire Custom Room ID & Password, and settle matches.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 self-start sm:self-auto">
                  {pendingBets.length} Pending Acceptance
                </span>
              </div>

              {bets.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-500 text-xs">
                  No 1v1 challenges placed yet.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {bets.map((b) => (
                    <div
                      key={b.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        b.status === 'pending'
                          ? 'bg-zinc-950 border-amber-500/40 shadow-lg'
                          : b.status === 'accepted'
                          ? 'bg-zinc-950 border-emerald-500/40 shadow-lg'
                          : 'bg-zinc-950/60 border-zinc-800/80 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Challenger details */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base font-bold text-white">{b.challengerName}</span>
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs text-amber-400">
                              UID: {b.challengerFFUid}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold">
                              {b.gameMode}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              b.status === 'accepted'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : b.status === 'completed'
                                ? 'bg-zinc-800 text-zinc-400'
                                : b.status === 'cancelled'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            }`}>
                              {b.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                            <span>Phone: <strong className="text-zinc-200">{b.challengerPhone}</strong></span>
                            {b.challengerWhatsapp && (
                              <a
                                href={`https://wa.me/${b.challengerWhatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(b.challengerName)},%20I%20accepted%20your%201v1%20challenge!`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp Challenger
                              </a>
                            )}
                            <span>Created: {new Date(b.createdAt).toLocaleTimeString()}</span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                            <span className="text-zinc-400 font-semibold">Match Rules: </span>
                            {b.rules}
                          </div>

                          {/* Room Credentials if already accepted */}
                          {b.roomId && (
                            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-4 text-xs font-mono">
                              <div>
                                <span className="text-zinc-400 block text-[10px]">Active Room ID:</span>
                                <strong className="text-white text-sm">{b.roomId}</strong>
                              </div>
                              <div>
                                <span className="text-zinc-400 block text-[10px]">Room Password:</span>
                                <strong className="text-amber-400 text-sm">{b.roomPassword || 'None'}</strong>
                              </div>
                            </div>
                          )}

                          {b.adminNote && (
                            <p className="text-xs text-zinc-400 italic">
                              Result: {b.adminNote}
                            </p>
                          )}
                        </div>

                        {/* Stakes & Action Buttons */}
                        <div className="flex flex-col items-end justify-between gap-3 flex-shrink-0">
                          
                          {/* Bet & Win Payout Card */}
                          <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-right min-w-[180px]">
                            <div className="flex justify-between items-center text-xs mb-1">
                              <span className="text-zinc-400">Player Bet:</span>
                              <span className="font-bold text-white">{currentSettings.currencySymbol}{b.betAmount}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-zinc-400">Winning Prize:</span>
                              <span className="font-bold text-emerald-400 text-sm">{currentSettings.currencySymbol}{b.winningPayout}</span>
                            </div>
                          </div>

                          {/* Action Buttons based on status */}
                          {b.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenAcceptBet(b)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-xs shadow-md active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
                              >
                                <Gamepad2 className="w-4 h-4" />
                                <span>Accept & Send Room Details</span>
                              </button>
                              <button
                                onClick={() => handleCancelBet(b.id)}
                                className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/40 font-bold text-xs cursor-pointer"
                                title="Cancel & Refund Bet"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {b.status === 'accepted' && (
                            <div className="space-y-1.5 text-right">
                              <span className="text-[11px] text-zinc-400 block">Declare Match Result:</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleDeclareWinner(b.id, 'player')}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow cursor-pointer"
                                  title={`Player Won -> Credits ${currentSettings.currencySymbol}${b.winningPayout} to player's wallet!`}
                                >
                                  🏆 Player Won (+{currentSettings.currencySymbol}{b.winningPayout})
                                </button>
                                <button
                                  onClick={() => handleDeclareWinner(b.id, 'admin')}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs cursor-pointer"
                                  title="Admin Won match"
                                >
                                  🛡️ Host Won
                                </button>
                                <button
                                  onClick={() => handleCancelBet(b.id)}
                                  className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-400 border border-red-800 text-xs cursor-pointer"
                                  title="Cancel Match & Refund"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}

                          {b.status === 'completed' && (
                            <div className="text-right">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                b.winner === 'player'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-zinc-800 text-zinc-300'
                              }`}>
                                Winner: {b.winner === 'player' ? 'Challenger Player' : 'Host (Admin)'}
                              </span>
                            </div>
                          )}

                          {b.status === 'cancelled' && (
                            <span className="text-xs text-red-400 italic">
                              Cancelled & 100% Refunded
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WITHDRAWAL REQUESTS */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-purple-400" />
                    Player Withdrawal Requests
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Send money to player via Indian UPI, PhonePe, Google Pay, or Paytm and mark as paid.
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 self-start sm:self-auto">
                  {pendingWithdrawals.length} Pending Payout
                </span>
              </div>

              {withdrawals.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950 rounded-2xl border border-zinc-800 text-zinc-500 text-xs">
                  No withdrawal requests yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawals.map((w) => (
                    <div
                      key={w.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        w.status === 'pending'
                          ? 'bg-zinc-950 border-purple-500/40 shadow-lg'
                          : 'bg-zinc-950/60 border-zinc-800/80 opacity-90'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-base font-bold text-white">{w.userName}</span>
                            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-xs text-amber-400">
                              UID: {w.freeFireUid}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              w.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : w.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse'
                            }`}>
                              {w.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                            <span>Phone: <strong className="text-zinc-200">{w.userPhone}</strong></span>
                            {w.userWhatsapp && (
                              <a
                                href={`https://wa.me/${w.userWhatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp
                              </a>
                            )}
                            <span>Requested: {new Date(w.createdAt).toLocaleString()}</span>
                          </div>

                          {/* Payout address info */}
                          <div className="pt-1.5 flex flex-wrap items-center gap-2 text-xs">
                            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                              <span className="text-zinc-400">Method: </span>
                              <strong className="text-amber-400">{w.payoutMethod}</strong>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono">
                              <span className="text-zinc-400">Send To: </span>
                              <strong className="text-white select-all">{w.payoutDetails}</strong>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                              <span className="text-zinc-400">A/C Name: </span>
                              <strong className="text-zinc-200">{w.accountHolder}</strong>
                            </div>
                          </div>

                          {w.adminNote && (
                            <p className="text-xs text-zinc-400 italic mt-1">
                              Note: {w.adminNote}
                            </p>
                          )}
                        </div>

                        {/* Amount & Actions */}
                        <div className="flex flex-row md:flex-col items-end justify-between gap-3 flex-shrink-0">
                          <div className="text-right">
                            <span className="text-xs text-zinc-400 block">Payout Amount</span>
                            <span className="text-2xl font-black text-amber-400 font-mono">
                              {currentSettings.currencySymbol}{w.amount}
                            </span>
                          </div>

                          {w.status === 'pending' ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveWithdrawal(w.id)}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md active:scale-95 transition-transform flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Mark as Paid</span>
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(w.id)}
                                className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/40 font-bold text-xs cursor-pointer"
                                title="Reject & Refund to Wallet"
                              >
                                Reject & Refund
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-400 italic">
                              Processed {w.processedAt ? new Date(w.processedAt).toLocaleTimeString() : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REGISTERED PLAYERS ROSTER */}
          {activeTab === 'players' && (
            <div className="space-y-4 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                  <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    All Registered Free Fire Players
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Search and manage player accounts, adjust wallet balances, or contact on WhatsApp.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                  <button
                    onClick={handleClearDemoPlayers}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Remove any sample or demo players"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Demo Accounts</span>
                  </button>
                  <button
                    onClick={handleDeleteAllPlayers}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Permanently remove all players from database"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete All Players</span>
                  </button>
                  <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300">
                    {users.length} Total Registered
                  </span>
                </div>
              </div>

              {users.length === 0 ? (
                <div className="p-8 rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center mx-auto text-zinc-500">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">No Registered Players Yet</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    All demo players have been cleared. When real players register through the site with their phone number and Free Fire UID, their profiles and wallet records will appear here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-900/80 text-zinc-400 uppercase font-semibold text-[11px] border-b border-zinc-800">
                      <tr>
                        <th className="px-4 py-3.5">Player / Name</th>
                        <th className="px-4 py-3.5">Free Fire UID</th>
                        <th className="px-4 py-3.5">Phone Number</th>
                        <th className="px-4 py-3.5">Password</th>
                        <th className="px-4 py-3.5">Wallet Balance</th>
                        <th className="px-4 py-3.5">Stats</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-900/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-white">
                            <div>
                              <span className="text-sm">{u.name}</span>
                              {u.inGameName && (
                                <span className="text-[11px] text-zinc-400 block font-mono">IGN: {u.inGameName}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-amber-400 select-all">
                            {u.freeFireUid}
                          </td>
                          <td className="px-4 py-3 space-y-0.5">
                            <div className="font-mono font-semibold text-zinc-200 select-all">{u.phone}</div>
                            {u.whatsapp && (
                              <a
                                href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                              >
                                <MessageCircle className="w-3 h-3" /> WhatsApp
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-xs px-2.5 py-1 rounded bg-zinc-900 border border-amber-500/30 text-amber-300 font-bold select-all inline-block shadow-inner">
                              {u.password || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-emerald-400 font-mono text-sm">
                              {currentSettings.currencySymbol}{u.balance}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-400 text-[11px]">
                            <div>Matches: <strong className="text-zinc-200">{u.totalMatches}</strong></div>
                            <div>Won: <strong className="text-amber-300">{currentSettings.currencySymbol}{u.totalWon}</strong></div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              <button
                                onClick={() => {
                                  setAdjustingUser(u);
                                  setAdjustMode('add');
                                  setAdjustAmount(50);
                                  setAdjustNote('Bonus / Credit');
                                }}
                                className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                title="Add Balance to Player"
                              >
                                <PlusCircle className="w-3 h-3" />
                                <span>+ Add</span>
                              </button>
                              <button
                                onClick={() => {
                                  setAdjustingUser(u);
                                  setAdjustMode('deduct');
                                  setAdjustAmount(Math.min(u.balance || 50, 50));
                                  setAdjustNote('Penalty / Match Loss / Deduction');
                                }}
                                className="px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                                title="Deduct / Cut Balance"
                              >
                                <MinusCircle className="w-3 h-3" />
                                <span>- Deduct</span>
                              </button>
                              <button
                                onClick={() => handleToggleBlock(u)}
                                className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                  u.status === 'blocked'
                                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700'
                                }`}
                                title={u.status === 'blocked' ? 'Unblock Player' : 'Block Player'}
                              >
                                {u.status === 'blocked' ? 'Blocked' : 'Active'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-xs cursor-pointer transition-colors"
                                title="Delete Player Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TOURNAMENTS HOST MANAGER */}
          {activeTab === 'tournaments' && (
            <div className="space-y-6 max-w-6xl">
              <div className="pb-3 border-b border-zinc-800">
                <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Tournament Management
                </h2>
                <p className="text-xs text-zinc-400">
                  Host new eSports events, set prizes, and manage room slots.
                </p>
              </div>

              {/* Create Tournament Card */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Host a New Tournament
                </h3>

                <form onSubmit={handleCreateTournament} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-zinc-400 mb-1">Tournament Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Bermuda Midnight Clash Squad Cup"
                        value={newTourneyTitle}
                        onChange={(e) => setNewTourneyTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Game Mode</label>
                      <select
                        value={newTourneyMode}
                        onChange={(e) => setNewTourneyMode(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option>4v4 Clash Squad</option>
                        <option>Solo Battle Royale</option>
                        <option>Duo Battle Royale</option>
                        <option>Squad Battle Royale</option>
                        <option>1v1 Lone Wolf Cup</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Map</label>
                      <input
                        type="text"
                        value={newTourneyMap}
                        onChange={(e) => setNewTourneyMap(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Entry Fee ({currentSettings.currencySymbol})</label>
                      <input
                        type="number"
                        value={newTourneyEntry}
                        onChange={(e) => setNewTourneyEntry(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Total Prize ({currentSettings.currencySymbol})</label>
                      <input
                        type="number"
                        value={newTourneyPrize}
                        onChange={(e) => setNewTourneyPrize(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">1st Prize ({currentSettings.currencySymbol})</label>
                      <input
                        type="number"
                        value={newTourneyFirst}
                        onChange={(e) => setNewTourneyFirst(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Total Slots</label>
                      <input
                        type="number"
                        value={newTourneySlots}
                        onChange={(e) => setNewTourneySlots(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Schedule / Match Time</label>
                      <input
                        type="text"
                        value={newTourneySchedule}
                        onChange={(e) => setNewTourneySchedule(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Custom Room ID & Pass (Optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Room ID"
                          value={newTourneyRoomId}
                          onChange={(e) => setNewTourneyRoomId(e.target.value)}
                          className="w-1/2 px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono"
                        />
                        <input
                          type="text"
                          placeholder="Pass"
                          value={newTourneyRoomPass}
                          onChange={(e) => setNewTourneyRoomPass(e.target.value)}
                          className="w-1/2 px-2.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Tournament</span>
                  </button>
                </form>
              </div>

              {/* Existing Tournaments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span>Active & Published Tournaments ({tournaments.length})</span>
                  </h3>
                </div>

                {tournaments.length === 0 ? (
                  <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-950 rounded-xl border border-zinc-800">
                    No tournaments published yet. Create one above to host an event!
                  </div>
                ) : (
                  tournaments.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col gap-3 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{t.title}</span>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-400 font-bold">
                              {t.gameMode}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              t.status === 'upcoming'
                                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                : t.status === 'ongoing'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : t.status === 'finished'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border-red-500/40'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-zinc-400 mt-1">
                            Map: <strong className="text-zinc-200">{t.map}</strong> • Entry: <strong className="text-amber-400">{currentSettings.currencySymbol}{t.entryFee}</strong> • Prize Pool: <strong className="text-emerald-400">{currentSettings.currencySymbol}{t.prizePool}</strong> • 1st: <strong className="text-amber-300">{currentSettings.currencySymbol}{t.firstPrize}</strong>
                          </p>
                          <p className="text-zinc-400 mt-0.5">
                            Time: <strong className="text-zinc-300">{t.scheduleTime}</strong> • Slots Filled: <strong className="text-white">{t.slotsFilled}/{t.slotsTotal}</strong>
                          </p>
                        </div>

                        {/* Status Change & Delete Button */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <select
                            value={t.status}
                            onChange={(e) => handleUpdateTournamentStatus(t, e.target.value as any)}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-[11px] text-zinc-200 focus:outline-none focus:border-amber-500"
                            title="Update status"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="finished">Finished</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleDeleteTournament(t)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Delete / Cancel Tournament"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Room & Participants details */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/60 p-2.5 rounded-lg text-[11px]">
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-zinc-400">Custom Room:</span>
                          <span className="text-zinc-200">ID: <strong className="text-amber-300">{t.roomId || 'Not set'}</strong></span>
                          <span className="text-zinc-200">Pass: <strong className="text-amber-300">{t.roomPass || 'Not set'}</strong></span>
                        </div>
                        <div className="text-zinc-400">
                          Joined Players: <strong className="text-zinc-200">{t.participants?.length || 0}</strong>
                          {t.participants && t.participants.length > 0 && (
                            <span className="text-zinc-500 ml-1">
                              ({t.participants.map(p => p.userName).join(', ')})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: LIVE SUPPORT CHAT & PLAYER INQUIRIES */}
          {activeTab === 'support' && (
            <div className="space-y-4 max-w-6xl h-[calc(100vh-140px)] flex flex-col">
              <div className="pb-3 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
                <div>
                  <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    In-App Live Support Desk & Player Chat
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Chat with players in real-time. Direct Telegram support also available at <strong>{currentSettings.supportTelegram || '@KARANxNXT'}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`https://t.me/${(currentSettings.supportTelegram || '@KARANxNXT').replace(/^@/, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Open Telegram Support</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex-1 min-h-0 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-xl">
                {/* Thread list sidebar */}
                <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col bg-zinc-900/40 flex-shrink-0">
                  <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-300">
                    <span>Player Inquiries ({supportThreads.length})</span>
                    {unreadSupportCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-sky-500 text-white text-[10px] font-black">
                        {unreadSupportCount} New
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-zinc-850">
                    {supportThreads.length === 0 ? (
                      <div className="p-6 text-center text-zinc-500 text-xs space-y-2">
                        <Headphones className="w-8 h-8 mx-auto text-zinc-600 opacity-50" />
                        <p className="font-semibold text-zinc-400">No inquiries yet</p>
                        <p className="text-[11px] text-zinc-500">
                          When players message you via the website Live Support widget, their chats appear here instantly.
                        </p>
                      </div>
                    ) : (
                      supportThreads.map((t) => {
                        const isSelected = activeThreadId === t.id;
                        const playerObj = users.find(u => u.id === t.userId || u.phone === t.userPhone);
                        return (
                          <div
                            key={t.id}
                            onClick={() => handleSelectSupportThread(t)}
                            className={`p-3.5 cursor-pointer transition-colors text-left flex items-start justify-between gap-2.5 ${
                              isSelected ? 'bg-amber-500/15 border-l-4 border-amber-500' : 'hover:bg-zinc-900/60'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="font-bold text-xs text-white truncate">{t.userName}</span>
                                {t.unreadByAdmin > 0 && (
                                  <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 animate-pulse" />
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate mb-1">
                                {t.lastMessage || 'Conversation started'}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                                <span>UID: {t.userFFUid || playerObj?.freeFireUid || 'Guest'}</span>
                                {playerObj && (
                                  <span className="text-emerald-400 font-bold"> {currentSettings.currencySymbol}{playerObj.balance}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span className="text-[10px] text-zinc-500">
                                {new Date(t.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSupportThread(t.id);
                                }}
                                className="p-1 rounded text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                                title="Delete thread"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Chat pane */}
                <div className="flex-1 flex flex-col bg-zinc-950/60 min-h-0">
                  {activeThreadId ? (() => {
                    const currentThread = supportThreads.find(t => t.id === activeThreadId);
                    if (!currentThread) {
                      return (
                        <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">
                          Select a conversation to reply
                        </div>
                      );
                    }
                    const activePlayer = users.find(u => u.id === currentThread.userId || u.phone === currentThread.userPhone);
                    return (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Chat Thread Header */}
                        <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-white text-xs sm:text-sm">{currentThread.userName}</h3>
                                {activePlayer && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Wallet: {currentSettings.currencySymbol}{activePlayer.balance}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400 flex items-center gap-2">
                                <span>Phone: {currentThread.userPhone}</span>
                                <span>•</span>
                                <span>Free Fire UID: <strong className="text-amber-400 font-mono">{currentThread.userFFUid || activePlayer?.freeFireUid || 'N/A'}</strong></span>
                              </p>
                            </div>
                          </div>
                          {activePlayer && (
                            <button
                              onClick={() => {
                                setAdjustingUser(activePlayer);
                                setAdjustAmount(50);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold border border-zinc-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Wallet className="w-3 h-3" />
                              <span>Adjust Balance</span>
                            </button>
                          )}
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/40">
                          {currentThread.messages.map((m) => {
                            const isAdmin = m.sender === 'admin';
                            return (
                              <div
                                key={m.id}
                                className={`flex items-start gap-2.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                              >
                                {!isAdmin && (
                                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs flex-shrink-0">
                                    <UserIcon className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div
                                  className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-md ${
                                    isAdmin
                                      ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-medium rounded-tr-none'
                                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                                  }`}
                                >
                                  <div className={`flex items-center justify-between gap-3 text-[10px] mb-1 ${isAdmin ? 'text-zinc-900/80 font-bold' : 'text-zinc-400'}`}>
                                    <span>{isAdmin ? 'You (Host Admin)' : currentThread.userName}</span>
                                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="whitespace-pre-wrap leading-relaxed select-text">{m.text}</p>
                                </div>
                                {isAdmin && (
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                                    <ShieldCheck className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Quick Reply Templates */}
                        <div className="px-3 py-2 bg-zinc-900/80 border-t border-zinc-850 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                          <span className="text-zinc-500 text-[10px] font-bold uppercase whitespace-nowrap">Quick:</span>
                          {[
                            '✓ Deposit verified! Balance credited to wallet.',
                            '✓ Room ID will be sent in 5 minutes.',
                            '⚠️ Please provide your 12-digit UTR payment receipt.',
                            '✓ Withdrawal processed and transferred via UPI.'
                          ].map((qr) => (
                            <button
                              key={qr}
                              type="button"
                              onClick={() => handleSendQuickReply(qr)}
                              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white whitespace-nowrap transition-colors cursor-pointer border border-zinc-700/60"
                            >
                              {qr}
                            </button>
                          ))}
                        </div>

                        {/* Reply Form */}
                        <form onSubmit={handleSendAdminReply} className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder={`Reply to ${currentThread.userName}...`}
                            value={adminReplyText}
                            onChange={(e) => setAdminReplyText(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="submit"
                            disabled={!adminReplyText.trim()}
                            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
                          >
                            <span>Send Reply</span>
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      </div>
                    );
                  })() : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 text-xs space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                        <MessageSquare className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-300 text-sm mb-1">No Conversation Selected</h4>
                        <p className="max-w-xs text-zinc-500 text-xs">
                          Select any player inquiry from the left sidebar to view their message history and reply directly.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS (UPI, QR CODE UPLOAD, TELEGRAM, PASSWORDS) */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl">
              <div className="pb-3 border-b border-zinc-800">
                <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5 text-amber-500" />
                  UPI ID, QR Scanner & Support Settings
                </h2>
                <p className="text-xs text-zinc-400">
                  Update your official UPI ID, upload your custom scanner QR image, and manage Telegram support handle.
                </p>
              </div>

              {settingsSaved && (
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Settings updated and saved permanently!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-5 bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
                
                {/* Admin Password */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-red-400" />
                    Admin Master Password
                  </label>
                  <input
                    type="password"
                    value={settingsForm.adminPassword}
                    onChange={(e) => setSettingsForm({ ...settingsForm, adminPassword: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Master password for admin dashboard access</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* UPI ID */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Admin Official UPI ID (for receiving deposits)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.upiId}
                      onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                      placeholder="8422001511@fam"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                      required
                    />
                    <p className="text-[10px] text-amber-400 mt-1">Current Active: <strong>{settingsForm.upiId}</strong></p>
                  </div>

                  {/* UPI Name */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Account / Merchant Display Name
                    </label>
                    <input
                      type="text"
                      value={settingsForm.upiName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, upiName: e.target.value })}
                      placeholder="Karan Esports"
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* QR CODE SCANNER UPLOAD SYSTEM */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-amber-400" />
                        Official UPI Scanner / QR Code
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        Upload your scanner image from your gallery, or generate a dynamic QR.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateDynamicQr}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-Generate from UPI</span>
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* QR Code Preview */}
                    <div className="w-36 h-36 bg-white p-2 rounded-xl border-2 border-amber-500/40 flex items-center justify-center flex-shrink-0 shadow-lg">
                      {settingsForm.qrCodeUrl ? (
                        <img
                          src={settingsForm.qrCodeUrl}
                          alt="Admin UPI Scanner"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-zinc-400 text-center text-xs">No QR Code</div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Upload Custom Scanner Image (from Phone / Gallery)
                        </label>
                        <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-dashed border-amber-500/50 text-amber-300 font-bold text-xs cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>Choose Scanner QR File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleQrFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Or QR Code Image URL
                        </label>
                        <input
                          type="url"
                          value={settingsForm.qrCodeUrl}
                          onChange={(e) => setSettingsForm({ ...settingsForm, qrCodeUrl: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                          placeholder="https://..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* TELEGRAM SUPPORT HANDLE */}
                <div className="p-4 rounded-xl bg-sky-950/20 border border-sky-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-sky-400" />
                      Official Telegram Customer Support Handle
                    </label>
                    {settingsForm.supportTelegram && (
                      <a
                        href={`https://t.me/${settingsForm.supportTelegram.replace(/^@/, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <span>Test Link</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <input
                    type="text"
                    value={settingsForm.supportTelegram || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, supportTelegram: e.target.value })}
                    placeholder="@KARANxNXT"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-sky-500 font-mono"
                    required
                  />
                  <p className="text-[11px] text-zinc-400">
                    Players clicking Telegram support will be redirected directly to: <span className="text-sky-300 font-mono">https://t.me/{(settingsForm.supportTelegram || '@KARANxNXT').replace(/^@/, '')}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Min Bet */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Minimum Bet ({settingsForm.currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={settingsForm.minBet}
                      onChange={(e) => setSettingsForm({ ...settingsForm, minBet: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm"
                      required
                    />
                  </div>
                  {/* Min Deposit */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Minimum Deposit ({settingsForm.currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={settingsForm.minDeposit}
                      onChange={(e) => setSettingsForm({ ...settingsForm, minDeposit: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm"
                      required
                    />
                  </div>
                  {/* Min Withdrawal */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Minimum Withdrawal ({settingsForm.currencySymbol})
                    </label>
                    <input
                      type="number"
                      value={settingsForm.minWithdrawal}
                      onChange={(e) => setSettingsForm({ ...settingsForm, minWithdrawal: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Announcement Notice Banner */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Top Notice Banner Announcement
                  </label>
                  <textarea
                    rows={2}
                    value={settingsForm.noticeBanner}
                    onChange={(e) => setSettingsForm({ ...settingsForm, noticeBanner: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-extrabold text-sm shadow-md cursor-pointer transition-all"
                >
                  Save & Apply Settings
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Accept 1v1 Bet Room ID Prompt Modal */}
      {acceptingBet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-amber-500" />
              Accept Challenge & Create Room
            </h3>
            <p className="text-xs text-zinc-400">
              Enter the Free Fire Custom Room ID and Password for challenger <strong className="text-white">{acceptingBet.challengerName}</strong> (UID: {acceptingBet.challengerFFUid}).
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-semibold">Custom Room ID *</label>
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="e.g. 8839201"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-semibold">Room Password</label>
                <input
                  type="text"
                  value={roomPassInput}
                  onChange={(e) => setRoomPassInput(e.target.value)}
                  placeholder="e.g. 123"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAcceptingBet(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAcceptBet}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow"
              >
                Send Room to Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust User Balance Modal */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-amber-400" />
                <span>Player Wallet: {adjustingUser.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setAdjustingUser(null)}
                className="text-zinc-500 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Current Player Info */}
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-zinc-400">Current Balance</p>
                <p className="text-xl font-mono font-bold text-white">
                  {currentSettings.currencySymbol}{adjustingUser.balance}
                </p>
              </div>
              <div className="text-right text-xs text-zinc-400">
                <p>FF UID: <span className="font-mono text-amber-300 font-bold">{adjustingUser.freeFireUid}</span></p>
                <p>Phone: <span className="font-mono text-zinc-300">{adjustingUser.phone}</span></p>
              </div>
            </div>

            {/* Action Mode Selection: Deduct (Red) vs Add (Green) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Select Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdjustMode('deduct');
                    setAdjustNote('Penalty / Tournament Loss / Manual Deduction');
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    adjustMode === 'deduct'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-950/50'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <MinusCircle className="w-4 h-4 text-rose-400" />
                  <span>Deduct Money (-)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAdjustMode('add');
                    setAdjustNote('Admin Bonus / Winnings Credit');
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    adjustMode === 'add'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  <span>Add Money (+)</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-semibold flex items-center justify-between">
                  <span>{adjustMode === 'deduct' ? 'Amount to Deduct (-)' : 'Amount to Add (+)'}</span>
                  <span className="text-[11px] font-normal text-zinc-400">
                    {adjustMode === 'deduct' ? 'Will be subtracted (-)' : 'Will be added (+)'}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">
                    {currentSettings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={adjustAmount || ''}
                    onChange={(e) => setAdjustAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="e.g. 50"
                    className={`w-full pl-8 pr-4 py-2.5 rounded-xl bg-zinc-950 border font-mono text-base font-bold focus:outline-none ${
                      adjustMode === 'deduct'
                        ? 'border-rose-500/50 focus:border-rose-500 text-rose-300'
                        : 'border-emerald-500/50 focus:border-emerald-500 text-emerald-300'
                    }`}
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-zinc-400">Quick Presets:</span>
                  {adjustMode === 'deduct' && adjustingUser.balance > 0 && (
                    <button
                      type="button"
                      onClick={() => setAdjustAmount(adjustingUser.balance)}
                      className="text-[11px] text-rose-400 hover:underline cursor-pointer font-bold"
                    >
                      Deduct All (Set balance to 0)
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[20, 50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAdjustAmount(amt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer ${
                        adjustAmount === amt
                          ? adjustMode === 'deduct'
                            ? 'bg-rose-500 text-white border-rose-400'
                            : 'bg-emerald-500 text-black border-emerald-400'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {adjustMode === 'deduct' ? '-' : '+'}{currentSettings.currencySymbol}{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculation Preview */}
              <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                adjustMode === 'deduct'
                  ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                  : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
              }`}>
                <span>Resulting Wallet Balance:</span>
                <span className="font-mono text-sm font-bold">
                  {currentSettings.currencySymbol}{adjustingUser.balance} {adjustMode === 'deduct' ? '-' : '+'} {currentSettings.currencySymbol}{adjustAmount} = {currentSettings.currencySymbol}{
                    adjustMode === 'deduct'
                      ? Math.max(0, adjustingUser.balance - adjustAmount)
                      : adjustingUser.balance + adjustAmount
                  }
                </span>
              </div>

              <div>
                <label className="block text-xs text-zinc-300 mb-1 font-semibold">Note / Reason</label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder={adjustMode === 'deduct' ? 'e.g. Penalty, tournament loss, manual deduction' : 'e.g. Bonus, winning prize, deposit correction'}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setAdjustingUser(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBalanceAdjust}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer ${
                  adjustMode === 'deduct'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                }`}
              >
                {adjustMode === 'deduct' ? (
                  <>
                    <MinusCircle className="w-4 h-4" />
                    <span>Deduct {currentSettings.currencySymbol}{adjustAmount}</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Add {currentSettings.currencySymbol}{adjustAmount}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
