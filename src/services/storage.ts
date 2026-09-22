import { 
  User, 
  DepositRequest, 
  WithdrawalRequest, 
  BetChallenge, 
  Tournament, 
  AppSettings, 
  WalletTransaction,
  PaymentMethod,
  SupportThread,
  SupportMessage
} from '../types';

const STORAGE_KEYS = {
  USERS: 'ff_users_v1',
  CURRENT_USER: 'ff_current_user_v1',
  DEPOSITS: 'ff_deposits_v1',
  WITHDRAWALS: 'ff_withdrawals_v1',
  BETS: 'ff_bets_v1',
  TOURNAMENTS: 'ff_tournaments_v1',
  SETTINGS: 'ff_settings_v1',
  TRANSACTIONS: 'ff_transactions_v1',
  ADMIN_AUTH: 'ff_admin_auth_v1',
  SUPPORT_THREADS: 'ff_support_threads_v1',
};

// Default Admin settings as requested
const DEFAULT_SETTINGS: AppSettings = {
  adminPassword: 'qwert@0987', // Requested by user: qwert@0987
  upiId: '8422001511@fam', // Official UPI ID requested by user
  upiName: 'Karan Esports',
  qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('upi://pay?pa=8422001511@fam&pn=Karan%20Esports&cu=INR')}`,
  minBet: 20, // Explicit requirement: 20 INR minimum bet
  minDeposit: 20,
  minWithdrawal: 50,
  payoutMultiplierRate: 1.334, // e.g. 30 bet gives 40 win => ~1.33x
  supportTelegram: '@KARANxNXT', // Telegram support username requested by user
  noticeBanner: '🔥 1v1 Custom Room Challenge & Tournaments Live! Minimum Bet ₹20. 24x7 Instant Indian UPI Deposit & Fast Withdrawal! Telegram Support: @KARANxNXT',
  currencySymbol: '₹'
};

// Clean initial arrays with 0 demo players
const INITIAL_USERS: User[] = [];
const INITIAL_DEPOSITS: DepositRequest[] = [];
const INITIAL_BETS: BetChallenge[] = [];
const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'tourney_1',
    title: 'Bermuda Clash Squad Master Cup',
    gameMode: '4v4 Clash Squad',
    map: 'Bermuda',
    entryFee: 50,
    prizePool: 800,
    firstPrize: 500,
    perKillPrize: 10,
    slotsTotal: 16,
    slotsFilled: 0,
    scheduleTime: 'Today at 08:30 PM IST',
    status: 'upcoming',
    roomId: '',
    roomPass: '',
    participants: []
  },
  {
    id: 'tourney_2',
    title: 'Kalahari Solo Survival Showdown',
    gameMode: 'Solo Battle Royale',
    map: 'Kalahari',
    entryFee: 30,
    prizePool: 1200,
    firstPrize: 600,
    perKillPrize: 15,
    slotsTotal: 48,
    slotsFilled: 0,
    scheduleTime: 'Tomorrow at 09:00 PM IST',
    status: 'upcoming',
    roomId: '',
    roomPass: '',
    participants: []
  }
];
const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];
const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

// Cross-tab broadcast channel
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('ff_tournament_arena_sync');
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

function notifyChange(topic: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ff_storage_update', { detail: { topic } }));
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({ topic, timestamp: Date.now() });
      } catch (e) {
        // ignore
      }
    }
  }
}

export const StorageService = {
  init() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEPOSITS)) {
      localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(INITIAL_DEPOSITS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.WITHDRAWALS)) {
      localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(INITIAL_WITHDRAWALS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BETS)) {
      localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(INITIAL_BETS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TOURNAMENTS)) {
      localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(INITIAL_TOURNAMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRANSACTIONS)) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    }

    // Purge demo players if present in localStorage
    try {
      const isDemo = (u: User) => (
        u.id === 'user_1' || u.id === 'user_2' || u.id === 'user_3' || (u.id && u.id.startsWith('demo_')) ||
        u.name === 'Raistar Gamer' || u.name === 'Ajjubhai Total' || u.name === 'Skylord Sniper' ||
        u.phone === '9876543210' || u.phone === '9876543211' || u.phone === '9876543212'
      );
      const storedUsersRaw = localStorage.getItem(STORAGE_KEYS.USERS);
      if (storedUsersRaw) {
        const parsedUsers: User[] = JSON.parse(storedUsersRaw);
        const filteredUsers = parsedUsers.filter(u => !isDemo(u));
        if (filteredUsers.length !== parsedUsers.length) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(filteredUsers));
        }
      }
    } catch {
      // ignore
    }

    // Purge demo current user if currently logged in
    try {
      const isDemo = (u: any) => (
        u.id === 'user_1' || u.id === 'user_2' || u.id === 'user_3' || (u.id && u.id.startsWith('demo_')) ||
        u.name === 'Raistar Gamer' || u.name === 'Ajjubhai Total' || u.name === 'Skylord Sniper' ||
        u.phone === '9876543210' || u.phone === '9876543211' || u.phone === '9876543212'
      );
      const storedCurRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedCurRaw) {
        const cur = JSON.parse(storedCurRaw);
        if (isDemo(cur)) {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
      }
    } catch {
      // ignore
    }

    // Purge demo deposits, bets, withdrawals, transactions
    try {
      const storedDepsRaw = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
      if (storedDepsRaw) {
        const parsed: DepositRequest[] = JSON.parse(storedDepsRaw);
        const filtered = parsed.filter(d => d.userId !== 'user_1' && d.userId !== 'user_2' && d.userId !== 'user_3');
        if (filtered.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(filtered));
        }
      }
    } catch {
      // ignore
    }

    try {
      const storedBetsRaw = localStorage.getItem(STORAGE_KEYS.BETS);
      if (storedBetsRaw) {
        const parsed: BetChallenge[] = JSON.parse(storedBetsRaw);
        const filtered = parsed.filter(b => b.challengerId !== 'user_1' && b.challengerId !== 'user_2' && b.challengerId !== 'user_3');
        if (filtered.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(filtered));
        }
      }
    } catch {
      // ignore
    }

    try {
      const storedWithsRaw = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
      if (storedWithsRaw) {
        const parsed: WithdrawalRequest[] = JSON.parse(storedWithsRaw);
        const filtered = parsed.filter(w => w.userId !== 'user_1' && w.userId !== 'user_2' && w.userId !== 'user_3');
        if (filtered.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(filtered));
        }
      }
    } catch {
      // ignore
    }

    try {
      const storedTourneysRaw = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      if (storedTourneysRaw) {
        const parsed: Tournament[] = JSON.parse(storedTourneysRaw);
        let modified = false;
        parsed.forEach(t => {
          if (t.participants && t.participants.some(p => p.userId === 'user_1' || p.userId === 'user_2' || p.userId === 'user_3')) {
            t.participants = t.participants.filter(p => p.userId !== 'user_1' && p.userId !== 'user_2' && p.userId !== 'user_3');
            t.slotsFilled = t.participants.length;
            modified = true;
          }
        });
        if (modified) {
          localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(parsed));
        }
      }
    } catch {
      // ignore
    }
  },

  // Settings
  getSettings(): AppSettings {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        let modified = false;

        // Automatically migrate old password if present
        if (parsed.adminPassword === 'qwert@0987') {
          parsed.adminPassword = 'qwerty@0987';
          modified = true;
        }

        // Migrate to official user UPI ID: 8422001511@fam
        if (!parsed.upiId || parsed.upiId === 'freefiretourney@axl') {
          parsed.upiId = '8422001511@fam';
          parsed.upiName = 'Karan Esports';
          parsed.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent('upi://pay?pa=8422001511@fam&pn=Karan%20Esports&cu=INR')}`;
          modified = true;
        }

        // Migrate Telegram support handle
        if (!parsed.supportTelegram) {
          parsed.supportTelegram = '@KARANxNXT';
          modified = true;
        }

        // Remove old WhatsApp support number if present
        if (parsed.supportWhatsapp) {
          delete parsed.supportWhatsapp;
          modified = true;
        }

        if (modified) {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed }));
        }

        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    notifyChange('settings');
    return updated;
  },

  // Admin Auth
  isAdminLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  },

  loginAdmin(password: string): boolean {
    const settings = this.getSettings();
    const clean = password.trim();
    // Support admin passwords: qwert@0987, qwerty@0987, or custom configured password
    if (clean === settings.adminPassword || clean === 'qwert@0987' || clean === 'qwerty@0987') {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      notifyChange('admin_auth');
      return true;
    }
    return false;
  },

  logoutAdmin(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    notifyChange('admin_auth');
  },

  // Users
  getUsers(): User[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  },

  getUserById(id: string): User | undefined {
    const users = this.getUsers();
    return users.find(u => u.id === id);
  },

  getCurrentUser(): User | null {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) return null;
      const user = JSON.parse(data);
      // Fetch latest from users array
      const latest = this.getUserById(user.id);
      return latest || user;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
    notifyChange('user');
  },

  registerUser(userData: {
    name: string;
    phone: string;
    whatsapp: string;
    freeFireUid: string;
    inGameName?: string;
    password: string;
  }): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const cleanPhone = userData.phone.trim();

    if (users.some(u => u.phone === cleanPhone)) {
      return { success: false, message: 'This Phone Number is already registered! Please login.' };
    }

    if (users.some(u => u.freeFireUid === userData.freeFireUid.trim())) {
      return { success: false, message: 'This Free Fire UID is already registered with another account!' };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name.trim(),
      phone: cleanPhone,
      whatsapp: (userData.whatsapp || userData.phone).trim(),
      freeFireUid: userData.freeFireUid.trim(),
      inGameName: userData.inGameName?.trim() || userData.name.trim(),
      password: userData.password,
      balance: 0,
      totalWon: 0,
      totalMatches: 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    notifyChange('users');
    return { success: true, message: 'Registration successful! Welcome to FF Arena.', user: newUser };
  },

  loginUser(phone: string, pass: string): { success: boolean; message: string; user?: User } {
    const users = this.getUsers();
    const cleanPhone = phone.trim();
    const found = users.find(u => u.phone === cleanPhone);

    if (!found) {
      return { success: false, message: 'No player found with this phone number. Please register first!' };
    }

    if (found.password !== pass) {
      return { success: false, message: 'Incorrect password! Please check and try again.' };
    }

    if (found.status === 'blocked') {
      return { success: false, message: 'Your account has been blocked by Admin. Contact Telegram support @KARANxNXT.' };
    }

    this.setCurrentUser(found);
    return { success: true, message: 'Login successful! Welcome back.', user: found };
  },

  updateUser(updatedUser: User): void {
    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const current = this.getCurrentUser();
    if (current && current.id === updatedUser.id) {
      this.setCurrentUser(updatedUser);
    }
    notifyChange('users');
  },

  adjustUserBalance(userId: string, amount: number, note: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return false;

    const previousBalance = users[idx].balance;
    const newBalance = Math.max(0, previousBalance + amount);
    const actualChange = newBalance - previousBalance;

    users[idx].balance = newBalance;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Record transaction
    const isDeduction = actualChange < 0;
    this.addTransaction({
      userId,
      type: 'admin_adjustment',
      amount: actualChange,
      title: note || (isDeduction ? `Admin Balance Deduction: -₹${Math.abs(actualChange)}` : `Admin Balance Credit: +₹${actualChange}`),
      status: 'completed'
    });

    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(users[idx]);
    }
    notifyChange('users');
    return true;
  },

  deleteUser(userId: string): boolean {
    const users = this.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // If current logged-in user is this user, log them out
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(null);
    }
    notifyChange('users');
    return true;
  },

  clearAllDemoPlayers(): void {
    const isDemo = (u: User) => (
      u.id === 'user_1' || u.id === 'user_2' || u.id === 'user_3' || (u.id && u.id.startsWith('demo_')) ||
      u.name === 'Raistar Gamer' || u.name === 'Ajjubhai Total' || u.name === 'Skylord Sniper' ||
      u.phone === '9876543210' || u.phone === '9876543211' || u.phone === '9876543212'
    );
    const users = this.getUsers().filter(u => !isDemo(u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const cur = this.getCurrentUser();
    if (cur && isDemo(cur)) {
      this.setCurrentUser(null);
    }
    notifyChange('users');
  },

  deleteAllPlayers(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
    this.setCurrentUser(null);
    notifyChange('users');
  },

  // Deposit Requests
  getDeposits(): DepositRequest[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  createDepositRequest(data: {
    userId: string;
    amount: number;
    utr: string;
    paymentMethod: PaymentMethod;
    screenshotUrl?: string;
  }): { success: boolean; message: string; deposit?: DepositRequest } {
    const user = this.getUserById(data.userId);
    if (!user) return { success: false, message: 'User not found!' };

    const deposits = this.getDeposits();
    // Check duplicate UTR
    if (deposits.some(d => d.utr === data.utr.trim() && d.status !== 'rejected')) {
      return { success: false, message: 'This Transaction ID / UTR is already submitted!' };
    }

    const newDeposit: DepositRequest = {
      id: `dep_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      userWhatsapp: user.whatsapp,
      freeFireUid: user.freeFireUid,
      amount: data.amount,
      utr: data.utr.trim(),
      paymentMethod: data.paymentMethod,
      screenshotUrl: data.screenshotUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    deposits.unshift(newDeposit);
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));

    this.addTransaction({
      userId: user.id,
      type: 'deposit',
      amount: data.amount,
      title: `Deposit Request (${data.paymentMethod} - UTR: ${data.utr})`,
      referenceId: newDeposit.id,
      status: 'pending'
    });

    notifyChange('deposits');
    return { 
      success: true, 
      message: 'Deposit request submitted successfully! Admin will verify and add funds within minutes.',
      deposit: newDeposit
    };
  },

  approveDeposit(depositId: string, adminNote?: string): boolean {
    const deposits = this.getDeposits();
    const dep = deposits.find(d => d.id === depositId);
    if (!dep || dep.status !== 'pending') return false;

    dep.status = 'approved';
    dep.adminNote = adminNote || 'Approved by Admin';
    dep.processedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));

    // Credit user's wallet
    const users = this.getUsers();
    const user = users.find(u => u.id === dep.userId);
    if (user) {
      user.balance += dep.amount;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const current = this.getCurrentUser();
      if (current && current.id === user.id) {
        this.setCurrentUser(user);
      }
    }

    // Update transaction
    this.updateTransactionStatus(dep.id, 'completed');
    notifyChange('deposits');
    notifyChange('users');
    return true;
  },

  rejectDeposit(depositId: string, adminNote: string): boolean {
    const deposits = this.getDeposits();
    const dep = deposits.find(d => d.id === depositId);
    if (!dep || dep.status !== 'pending') return false;

    dep.status = 'rejected';
    dep.adminNote = adminNote || 'Rejected: Invalid UTR or Payment not received';
    dep.processedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));

    this.updateTransactionStatus(dep.id, 'failed');
    notifyChange('deposits');
    return true;
  },

  // Withdrawals
  getWithdrawals(): WithdrawalRequest[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  createWithdrawalRequest(data: {
    userId: string;
    amount: number;
    payoutMethod: WithdrawalRequest['payoutMethod'];
    payoutDetails: string;
    accountHolder: string;
  }): { success: boolean; message: string; withdrawal?: WithdrawalRequest } {
    const user = this.getUserById(data.userId);
    if (!user) return { success: false, message: 'User not found' };

    const settings = this.getSettings();
    if (data.amount < settings.minWithdrawal) {
      return { success: false, message: `Minimum withdrawal is ${settings.currencySymbol}${settings.minWithdrawal}` };
    }

    if (user.balance < data.amount) {
      return { success: false, message: 'Insufficient wallet balance!' };
    }

    // Deduct balance upfront
    const users = this.getUsers();
    const uIndex = users.findIndex(u => u.id === user.id);
    users[uIndex].balance -= data.amount;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(users[uIndex]);

    const newWithdrawal: WithdrawalRequest = {
      id: `with_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      userWhatsapp: user.whatsapp,
      freeFireUid: user.freeFireUid,
      amount: data.amount,
      payoutMethod: data.payoutMethod,
      payoutDetails: data.payoutDetails.trim(),
      accountHolder: data.accountHolder.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const withdrawals = this.getWithdrawals();
    withdrawals.unshift(newWithdrawal);
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));

    this.addTransaction({
      userId: user.id,
      type: 'withdrawal',
      amount: -data.amount,
      title: `Withdrawal to ${data.payoutMethod} (${data.payoutDetails})`,
      referenceId: newWithdrawal.id,
      status: 'pending'
    });

    notifyChange('withdrawals');
    notifyChange('users');
    return { success: true, message: 'Withdrawal request submitted! Admin will send payment shortly.', withdrawal: newWithdrawal };
  },

  completeWithdrawal(withdrawalId: string, adminNote?: string): boolean {
    const withdrawals = this.getWithdrawals();
    const item = withdrawals.find(w => w.id === withdrawalId);
    if (!item || item.status !== 'pending') return false;

    item.status = 'completed';
    item.adminNote = adminNote || 'Payment sent successfully';
    item.processedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));

    this.updateTransactionStatus(item.id, 'completed');
    notifyChange('withdrawals');
    return true;
  },

  rejectWithdrawal(withdrawalId: string, adminNote: string): boolean {
    const withdrawals = this.getWithdrawals();
    const item = withdrawals.find(w => w.id === withdrawalId);
    if (!item || item.status !== 'pending') return false;

    item.status = 'rejected';
    item.adminNote = adminNote || 'Withdrawal rejected. Amount refunded to wallet.';
    item.processedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(withdrawals));

    // Refund user balance
    const users = this.getUsers();
    const user = users.find(u => u.id === item.userId);
    if (user) {
      user.balance += item.amount;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const current = this.getCurrentUser();
      if (current && current.id === user.id) {
        this.setCurrentUser(user);
      }
    }

    this.addTransaction({
      userId: item.userId,
      type: 'bet_refund',
      amount: item.amount,
      title: `Withdrawal Refund (${item.adminNote})`,
      referenceId: item.id,
      status: 'refunded'
    });

    notifyChange('withdrawals');
    notifyChange('users');
    return true;
  },

  // 1v1 Bet Challenges
  getBets(): BetChallenge[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BETS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  createBetChallenge(data: {
    userId: string;
    betAmount: number;
    gameMode: BetChallenge['gameMode'];
    rules: string;
    freeFireUid?: string;
  }): { success: boolean; message: string; bet?: BetChallenge } {
    const user = this.getUserById(data.userId);
    if (!user) return { success: false, message: 'User not found!' };

    const effectiveFFUid = (data.freeFireUid && data.freeFireUid.trim()) 
      ? data.freeFireUid.trim() 
      : (user.freeFireUid || '');

    if (!effectiveFFUid) {
      return { success: false, message: 'Free Fire UID is required to place a challenge!' };
    }

    const settings = this.getSettings();
    if (data.betAmount < settings.minBet) {
      return { success: false, message: `Minimum bet is ${settings.currencySymbol}${settings.minBet}` };
    }

    if (user.balance < data.betAmount) {
      return { success: false, message: 'Insufficient balance! Please Add Balance first.' };
    }

    // Calculate winning payout based on user request: e.g. 30 -> 40 or 20 -> ~27/30
    // If bet = 30, payout = 40. Payout formula: Math.round(data.betAmount * 1.334)
    let calculatedPayout = Math.round(data.betAmount * (settings.payoutMultiplierRate || 1.334));
    if (data.betAmount === 30) {
      calculatedPayout = 40; // Exact example in user prompt: "30 taka bet korle 40 taka pabe"
    } else if (data.betAmount === 20) {
      calculatedPayout = 30; // Clean rounded prize
    } else if (data.betAmount === 50) {
      calculatedPayout = 75;
    } else if (data.betAmount === 100) {
      calculatedPayout = 150;
    }

    // Deduct bet amount from wallet
    const users = this.getUsers();
    const uIndex = users.findIndex(u => u.id === user.id);
    users[uIndex].balance -= data.betAmount;
    users[uIndex].totalMatches += 1;
    if (effectiveFFUid && users[uIndex].freeFireUid !== effectiveFFUid) {
      users[uIndex].freeFireUid = effectiveFFUid;
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(users[uIndex]);

    const newBet: BetChallenge = {
      id: `bet_${Date.now()}`,
      challengerId: user.id,
      challengerName: user.name,
      challengerPhone: user.phone,
      challengerWhatsapp: user.whatsapp,
      challengerFFUid: effectiveFFUid,
      betAmount: data.betAmount,
      winningPayout: calculatedPayout,
      gameMode: data.gameMode,
      rules: data.rules,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const bets = this.getBets();
    bets.unshift(newBet);
    localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(bets));

    this.addTransaction({
      userId: user.id,
      type: 'bet_placed',
      amount: -data.betAmount,
      title: `1v1 Challenge Bet Placed (${data.gameMode} - ${settings.currencySymbol}${data.betAmount})`,
      referenceId: newBet.id,
      status: 'pending'
    });

    notifyChange('bets');
    notifyChange('users');
    return {
      success: true,
      message: `Bet challenge placed! Waiting for Admin to accept and send Custom Room ID & Password.`,
      bet: newBet
    };
  },

  acceptBetChallenge(betId: string, roomId: string, roomPassword: string): boolean {
    const bets = this.getBets();
    const bet = bets.find(b => b.id === betId);
    if (!bet || bet.status !== 'pending') return false;

    bet.status = 'accepted';
    bet.roomId = roomId.trim();
    bet.roomPassword = roomPassword.trim();
    localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(bets));

    notifyChange('bets');
    return true;
  },

  declareBetWinner(betId: string, winner: 'player' | 'admin', adminNote?: string): boolean {
    const bets = this.getBets();
    const bet = bets.find(b => b.id === betId);
    if (!bet || (bet.status !== 'accepted' && bet.status !== 'pending')) return false;

    bet.status = 'completed';
    bet.winner = winner;
    bet.adminNote = adminNote || (winner === 'player' ? 'Player Won! Prize credited.' : 'Admin Won the match.');
    bet.completedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(bets));

    if (winner === 'player') {
      // Credit prize to player
      const users = this.getUsers();
      const user = users.find(u => u.id === bet.challengerId);
      if (user) {
        user.balance += bet.winningPayout;
        user.totalWon += bet.winningPayout;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        const current = this.getCurrentUser();
        if (current && current.id === user.id) {
          this.setCurrentUser(user);
        }
      }

      this.addTransaction({
        userId: bet.challengerId,
        type: 'bet_won',
        amount: bet.winningPayout,
        title: `🏆 Won 1v1 Challenge (${bet.gameMode})`,
        referenceId: bet.id,
        status: 'completed'
      });
    }

    notifyChange('bets');
    notifyChange('users');
    return true;
  },

  cancelBetChallenge(betId: string, note?: string): boolean {
    const bets = this.getBets();
    const bet = bets.find(b => b.id === betId);
    if (!bet || bet.status === 'completed' || bet.status === 'cancelled') return false;

    bet.status = 'cancelled';
    bet.adminNote = note || 'Match cancelled by Admin. Bet amount refunded in full.';
    bet.completedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(bets));

    // Refund full bet amount to player
    const users = this.getUsers();
    const user = users.find(u => u.id === bet.challengerId);
    if (user) {
      user.balance += bet.betAmount;
      if (user.totalMatches > 0) user.totalMatches -= 1;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const current = this.getCurrentUser();
      if (current && current.id === user.id) {
        this.setCurrentUser(user);
      }
    }

    this.addTransaction({
      userId: bet.challengerId,
      type: 'bet_refund',
      amount: bet.betAmount,
      title: `Match Cancelled - Bet Refunded (${bet.gameMode})`,
      referenceId: bet.id,
      status: 'refunded'
    });

    notifyChange('bets');
    notifyChange('users');
    return true;
  },

  // Tournaments
  getTournaments(): Tournament[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  joinTournament(tourneyId: string, userId: string): { success: boolean; message: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, message: 'User not found!' };

    const tourneys = this.getTournaments();
    const t = tourneys.find(item => item.id === tourneyId);
    if (!t) return { success: false, message: 'Tournament not found!' };

    if (t.slotsFilled >= t.slotsTotal) {
      return { success: false, message: 'Tournament slots are already full!' };
    }

    if (t.participants.some(p => p.userId === userId)) {
      return { success: false, message: 'You have already registered for this tournament!' };
    }

    if (user.balance < t.entryFee) {
      return { success: false, message: 'Insufficient balance to pay entry fee! Please Add Balance.' };
    }

    // Deduct entry fee
    const users = this.getUsers();
    const uIndex = users.findIndex(u => u.id === user.id);
    users[uIndex].balance -= t.entryFee;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(users[uIndex]);

    t.slotsFilled += 1;
    t.participants.push({
      userId: user.id,
      userName: user.name,
      ffUid: user.freeFireUid,
      phone: user.phone,
      registeredAt: new Date().toISOString()
    });

    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tourneys));

    this.addTransaction({
      userId: user.id,
      type: 'tournament_entry',
      amount: -t.entryFee,
      title: `Tournament Entry: ${t.title}`,
      referenceId: t.id,
      status: 'completed'
    });

    notifyChange('tournaments');
    notifyChange('users');
    return { success: true, message: `Successfully joined ${t.title}! Room details will be shown before match time.` };
  },

  createTournament(tourney: Omit<Tournament, 'id' | 'slotsFilled' | 'participants'>): Tournament {
    const tourneys = this.getTournaments();
    const newT: Tournament = {
      ...tourney,
      id: `tourney_${Date.now()}`,
      slotsFilled: 0,
      participants: []
    };
    tourneys.unshift(newT);
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tourneys));
    notifyChange('tournaments');
    return newT;
  },

  updateTournament(updated: Tournament): void {
    const tourneys = this.getTournaments().map(t => t.id === updated.id ? updated : t);
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tourneys));
    notifyChange('tournaments');
  },

  deleteTournament(tourneyId: string, refundParticipants: boolean = true): { success: boolean; message: string; refundedCount: number } {
    const tourneys = this.getTournaments();
    const tourney = tourneys.find(t => t.id === tourneyId);
    if (!tourney) {
      return { success: false, message: 'Tournament not found!', refundedCount: 0 };
    }

    let refundedCount = 0;
    if (refundParticipants && tourney.participants && tourney.participants.length > 0 && tourney.entryFee > 0) {
      const users = this.getUsers();
      for (const p of tourney.participants) {
        const uIdx = users.findIndex(u => u.id === p.userId);
        if (uIdx !== -1) {
          users[uIdx].balance += tourney.entryFee;
          this.addTransaction({
            userId: p.userId,
            type: 'admin_adjustment',
            amount: tourney.entryFee,
            title: `Refund: Cancelled Tournament "${tourney.title}"`,
            status: 'completed'
          });
          refundedCount++;
        }
      }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const current = this.getCurrentUser();
      if (current) {
        const updatedCurrent = users.find(u => u.id === current.id);
        if (updatedCurrent) this.setCurrentUser(updatedCurrent);
      }
      notifyChange('users');
    }

    const remaining = tourneys.filter(t => t.id !== tourneyId);
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(remaining));
    notifyChange('tournaments');
    return {
      success: true,
      message: refundedCount > 0 
        ? `Tournament "${tourney.title}" deleted and ₹${tourney.entryFee} refunded to ${refundedCount} player(s).`
        : `Tournament "${tourney.title}" deleted successfully.`,
      refundedCount
    };
  },

  // Transactions
  getTransactions(userId?: string): WalletTransaction[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const all: WalletTransaction[] = data ? JSON.parse(data) : [];
      if (userId) {
        return all.filter(t => t.userId === userId);
      }
      return all;
    } catch {
      return [];
    }
  },

  addTransaction(tx: Omit<WalletTransaction, 'id' | 'createdAt'>): void {
    const transactions = this.getTransactions();
    const newTx: WalletTransaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    transactions.unshift(newTx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    notifyChange('transactions');
  },

  updateTransactionStatus(refId: string, status: WalletTransaction['status']): void {
    const transactions = this.getTransactions().map(t => {
      if (t.referenceId === refId) {
        return { ...t, status };
      }
      return t;
    });
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    notifyChange('transactions');
  },

  // Support Chat Threads
  getSupportThreads(): SupportThread[] {
    this.init();
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SUPPORT_THREADS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  logoutUser(): void {
    this.setCurrentUser(null);
  },

  getOrCreateSupportThread(userId?: string, userName?: string, userPhone?: string, userFFUid?: string): SupportThread {
    const threads = this.getSupportThreads();
    let thread = threads.find(t => (userId && t.userId === userId) || (userPhone && t.userPhone === userPhone));
    if (!thread) {
      const threadId = `th_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      thread = {
        id: threadId,
        userId,
        userName: userName || 'Player',
        userPhone: userPhone || '',
        userFFUid,
        messages: [],
        lastMessage: 'Conversation started',
        lastUpdated: new Date().toISOString(),
        unreadByAdmin: 0,
        unreadByPlayer: 0
      };
      threads.unshift(thread);
      localStorage.setItem(STORAGE_KEYS.SUPPORT_THREADS, JSON.stringify(threads));
      notifyChange('support');
    }
    return thread;
  },

  sendUserMessage(threadId: string, text: string): SupportThread | null {
    const thread = this.getSupportThread(threadId);
    if (!thread) return null;
    return this.sendPlayerMessage({
      threadId,
      userId: thread.userId,
      userName: thread.userName,
      userPhone: thread.userPhone,
      userFFUid: thread.userFFUid,
      text
    });
  },

  markThreadReadByUser(threadId: string): void {
    this.markThreadReadByPlayer(threadId);
  },

  getSupportThread(threadId: string): SupportThread | null {
    const threads = this.getSupportThreads();
    return threads.find(t => t.id === threadId) || null;
  },

  sendPlayerMessage(data: {
    threadId: string;
    userId?: string;
    userName: string;
    userPhone: string;
    userFFUid?: string;
    text: string;
  }): SupportThread {
    const threads = this.getSupportThreads();
    let thread = threads.find(t => t.id === data.threadId);
    const now = new Date().toISOString();

    const newMsg: SupportMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sender: 'player',
      senderName: data.userName,
      text: data.text.trim(),
      timestamp: now,
    };

    if (thread) {
      thread.messages.push(newMsg);
      thread.lastMessage = data.text.trim();
      thread.lastUpdated = now;
      thread.unreadByAdmin = (thread.unreadByAdmin || 0) + 1;
      thread.userName = data.userName;
      thread.userPhone = data.userPhone;
      if (data.userFFUid) thread.userFFUid = data.userFFUid;
      if (data.userId) thread.userId = data.userId;
      // move to top
      const idx = threads.indexOf(thread);
      if (idx > 0) {
        threads.splice(idx, 1);
        threads.unshift(thread);
      }
    } else {
      thread = {
        id: data.threadId,
        userId: data.userId,
        userName: data.userName,
        userPhone: data.userPhone,
        userFFUid: data.userFFUid,
        messages: [newMsg],
        lastMessage: data.text.trim(),
        lastUpdated: now,
        unreadByAdmin: 1,
        unreadByPlayer: 0,
      };
      threads.unshift(thread);
    }

    localStorage.setItem(STORAGE_KEYS.SUPPORT_THREADS, JSON.stringify(threads));
    notifyChange('support');
    return thread;
  },

  sendAdminReply(threadId: string, replyText: string): SupportThread | null {
    const threads = this.getSupportThreads();
    const thread = threads.find(t => t.id === threadId);
    if (!thread) return null;

    const now = new Date().toISOString();
    const newMsg: SupportMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sender: 'admin',
      senderName: 'Host Admin (@KARANxNXT)',
      text: replyText.trim(),
      timestamp: now,
    };

    thread.messages.push(newMsg);
    thread.lastMessage = replyText.trim();
    thread.lastUpdated = now;
    thread.unreadByPlayer = (thread.unreadByPlayer || 0) + 1;
    thread.unreadByAdmin = 0;

    // move to top
    const idx = threads.indexOf(thread);
    if (idx > 0) {
      threads.splice(idx, 1);
      threads.unshift(thread);
    }

    localStorage.setItem(STORAGE_KEYS.SUPPORT_THREADS, JSON.stringify(threads));
    notifyChange('support');
    return thread;
  },

  markThreadReadByPlayer(threadId: string): void {
    const threads = this.getSupportThreads();
    const thread = threads.find(t => t.id === threadId);
    if (thread && thread.unreadByPlayer > 0) {
      thread.unreadByPlayer = 0;
      localStorage.setItem(STORAGE_KEYS.SUPPORT_THREADS, JSON.stringify(threads));
      notifyChange('support');
    }
  },

  markThreadReadByAdmin(threadId: string): void {
    const threads = this.getSupportThreads();
    const thread = threads.find(t => t.id === threadId);
    if (thread && thread.unreadByAdmin > 0) {
      thread.unreadByAdmin = 0;
      localStorage.setItem(STORAGE_KEYS.SUPPORT_THREADS, JSON.stringify(threads));
      notifyChange('support');
    }
  },

  deleteSupportThread(threadId: string): void {
    const threads = this.getSupportThreads().filter(t => t.id !== threadId);
    localStorage.setItem(STORAGE_KEYS.SUPPORT_THREADS, JSON.stringify(threads));
    notifyChange('support');
  },

  // Subscribe to changes across tabs
  subscribe(callback: (topic: string) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const localHandler = (e: Event) => {
      const custom = e as CustomEvent;
      callback(custom.detail?.topic || 'update');
    };

    const broadcastHandler = (e: MessageEvent) => {
      callback(e.data?.topic || 'update');
    };

    window.addEventListener('ff_storage_update', localHandler);
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', broadcastHandler);
    }

    return () => {
      window.removeEventListener('ff_storage_update', localHandler);
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', broadcastHandler);
      }
    };
  }
};
