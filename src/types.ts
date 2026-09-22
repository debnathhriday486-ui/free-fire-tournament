export interface User {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  freeFireUid: string;
  inGameName?: string;
  password: string;
  balance: number;
  totalWon: number;
  totalMatches: number;
  createdAt: string;
  status: 'active' | 'blocked';
}

export type PaymentMethod = 'UPI' | 'QR' | 'PhonePe' | 'GPay' | 'Paytm' | 'BHIM';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userWhatsapp: string;
  freeFireUid: string;
  amount: number;
  utr: string;
  paymentMethod: PaymentMethod;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userWhatsapp: string;
  freeFireUid: string;
  amount: number;
  payoutMethod: 'UPI' | 'PhonePe' | 'GPay' | 'Paytm' | 'BHIM';
  payoutDetails: string;
  accountHolder: string;
  status: 'pending' | 'completed' | 'rejected';
  adminNote?: string;
  createdAt: string;
  processedAt?: string;
}

export type GameMode = 
  | '1v1 Clash Squad'
  | '1v1 Lone Wolf'
  | '2v2 Clash Squad'
  | '4v4 Clash Squad'
  | 'Custom Room BR';

export interface BetChallenge {
  id: string;
  challengerId: string;
  challengerName: string;
  challengerPhone: string;
  challengerWhatsapp: string;
  challengerFFUid: string;
  betAmount: number;
  winningPayout: number;
  gameMode: GameMode;
  rules: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  roomId?: string;
  roomPassword?: string;
  winner?: 'player' | 'admin' | 'none';
  adminNote?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Tournament {
  id: string;
  title: string;
  gameMode: string;
  map: string;
  entryFee: number;
  prizePool: number;
  firstPrize: number;
  perKillPrize: number;
  slotsTotal: number;
  slotsFilled: number;
  scheduleTime: string;
  status: 'upcoming' | 'ongoing' | 'finished' | 'cancelled';
  roomId?: string;
  roomPass?: string;
  participants: {
    userId: string;
    userName: string;
    ffUid: string;
    phone: string;
    registeredAt: string;
  }[];
}

export interface AppSettings {
  adminPassword: string; // Defaults to "qwerty@0987"
  upiId: string;
  upiName: string;
  qrCodeUrl: string;
  minBet: number; // Defaults to 20
  minDeposit: number;
  minWithdrawal: number;
  payoutMultiplierRate: number; // e.g., 30 bet gives 40 win => ~1.33x
  supportWhatsapp?: string;
  supportTelegram: string; // @KARANxNXT
  noticeBanner: string;
  currencySymbol: string;
}

export interface SupportMessage {
  id: string;
  sender: 'player' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportThread {
  id: string; // thread id (e.g. user id or session id)
  userId?: string;
  userName: string;
  userPhone: string;
  userFFUid?: string;
  messages: SupportMessage[];
  lastMessage: string;
  lastUpdated: string;
  unreadByAdmin: number;
  unreadByPlayer: number;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bet_placed' | 'bet_won' | 'bet_refund' | 'tournament_entry' | 'admin_adjustment';
  amount: number;
  title: string;
  referenceId?: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  createdAt: string;
}
