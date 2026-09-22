import React, { useState, useEffect, useRef } from 'react';
import { User, AppSettings, SupportThread } from '../types';
import { StorageService } from '../services/storage';
import { 
  X, 
  Send, 
  Headphones, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  User as UserIcon,
  Clock
} from 'lucide-react';

interface LiveSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  settings: AppSettings;
  onOpenAuth: () => void;
}

export const LiveSupportModal: React.FC<LiveSupportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  settings,
  onOpenAuth
}) => {
  const [inputText, setInputText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestFFUid, setGuestFFUid] = useState('');
  const [thread, setThread] = useState<SupportThread | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load existing or initialize thread for this user/guest
  useEffect(() => {
    if (!isOpen) return;

    if (currentUser) {
      let t = StorageService.getSupportThreads().find(
        (st) => st.userId === currentUser.id || st.userPhone === currentUser.phone
      );
      if (!t) {
        t = StorageService.getOrCreateSupportThread(
          currentUser.id,
          currentUser.name,
          currentUser.phone,
          currentUser.freeFireUid
        );
      } else {
        StorageService.markThreadReadByUser(t.id);
      }
      setThread(t || null);
    }
  }, [isOpen, currentUser]);

  // Subscribe to real-time support updates
  useEffect(() => {
    if (!isOpen) return;

    const unsub = StorageService.subscribe((topic) => {
      if (topic === 'support' || topic === 'all') {
        if (currentUser) {
          const t = StorageService.getSupportThreads().find(
            (st) => st.userId === currentUser.id || st.userPhone === currentUser.phone
          );
          if (t) {
            setThread(t);
            StorageService.markThreadReadByUser(t.id);
          }
        } else if (thread) {
          const t = StorageService.getSupportThreads().find((st) => st.id === thread.id);
          if (t) setThread(t);
        }
      }
    });

    return unsub;
  }, [isOpen, currentUser, thread?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread?.messages]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let targetThread = thread;

    if (!targetThread) {
      if (currentUser) {
        targetThread = StorageService.getOrCreateSupportThread(
          currentUser.id,
          currentUser.name,
          currentUser.phone,
          currentUser.freeFireUid
        );
      } else {
        if (!guestPhone.trim() || !guestName.trim()) {
          alert('Please enter your Name and WhatsApp/Phone number so the Admin can assist you!');
          return;
        }
        targetThread = StorageService.getOrCreateSupportThread(
          `guest_${Date.now()}`,
          guestName.trim(),
          guestPhone.trim(),
          guestFFUid.trim() || undefined
        );
      }
      setThread(targetThread);
    }

    if (targetThread) {
      StorageService.sendUserMessage(targetThread.id, inputText.trim());
      setInputText('');
      const updated = StorageService.getSupportThreads().find((st) => st.id === targetThread!.id);
      setThread(updated || null);
    }
  };

  const telegramUser = (settings.supportTelegram || '@KARANxNXT').replace(/^@/, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[580px] max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-heading font-bold text-white">
                  24x7 Host Support Desk
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-zinc-400">
                Direct chat with Admin & Telegram help
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram Direct Support Banner */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-sky-950/40 via-zinc-950 to-sky-950/40 border-b border-sky-900/40 flex items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-2 text-sky-300">
            <Send className="w-4 h-4 text-sky-400 flex-shrink-0" />
            <span>Fast reply on Telegram: <strong className="font-mono text-white">@{telegramUser}</strong></span>
          </div>
          <a
            href={`https://t.me/${telegramUser}`}
            target="_blank"
            rel="noreferrer"
            className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-[11px] flex items-center gap-1 shadow flex-shrink-0"
          >
            <span>Open Telegram</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Messages or Guest identification form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/50">
          {!currentUser && !thread && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Start Live Conversation
              </h4>
              <p className="text-xs text-zinc-400">
                Enter your details to message Admin, or login to automatically sync your Free Fire wallet.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp / Phone Number"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Free Fire UID (Optional)"
                  value={guestFFUid}
                  onChange={(e) => setGuestFFUid(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white font-mono"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Or Login with existing account
                </button>
              </div>
            </div>
          )}

          {/* Active messages */}
          {thread?.messages && thread.messages.length > 0 ? (
            thread.messages.map((m) => {
              const isAdmin = m.sender === 'admin';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  {isAdmin && (
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs flex-shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-3 text-xs shadow-md ${
                      isAdmin
                        ? 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-none'
                        : 'bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 font-medium rounded-tr-none'
                    }`}
                  >
                    <div className={`flex items-center justify-between gap-3 text-[10px] mb-1 ${isAdmin ? 'text-amber-400 font-bold' : 'text-zinc-900/80 font-bold'}`}>
                      <span>{isAdmin ? 'Admin / Host' : 'You'}</span>
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed select-text">{m.text}</p>
                  </div>

                  {!isAdmin && (
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold text-xs flex-shrink-0">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-zinc-500 text-xs space-y-1">
              <Headphones className="w-10 h-10 mx-auto opacity-30 text-amber-500 mb-2" />
              <p className="font-semibold text-zinc-400">Ask any question or report match results</p>
              <p className="text-[11px] text-zinc-500">Deposit help, 1v1 Room issues, or custom challenges.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2 flex-shrink-0">
          <input
            type="text"
            placeholder="Type your message to Admin..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
