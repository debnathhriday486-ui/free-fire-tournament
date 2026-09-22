import React from 'react';
import { AppSettings } from '../types';
import { Sparkles, Send } from 'lucide-react';

interface NoticeBannerProps {
  settings: AppSettings;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = ({ settings }) => {
  const telegramHandle = (settings.supportTelegram || '@KARANxNXT').replace(/^@/, '');

  return (
    <div className="bg-gradient-to-r from-red-950/70 via-zinc-900 to-amber-950/70 border-b border-amber-500/20 py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        
        {/* Notice text */}
        <div className="flex items-center gap-2 text-zinc-300 text-center sm:text-left">
          <span className="flex h-2 w-2 relative flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold text-amber-400 flex-shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Notice:
          </span>
          <span className="text-zinc-200 line-clamp-1 sm:line-clamp-none">
            {settings.noticeBanner || `Minimum Bet is ${settings.currencySymbol}${settings.minBet}. 100% Trusted Free Fire 1v1 Room Challenge & Tournaments.`}
          </span>
        </div>

        {/* Telegram direct support button */}
        <a
          id="btn_notice_telegram_support"
          href={`https://t.me/${telegramHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/40 font-bold transition-all text-[11px] flex-shrink-0 group shadow-sm"
        >
          <Send className="w-3.5 h-3.5 fill-sky-400 group-hover:scale-110 transition-transform" />
          <span>Telegram Support: @{telegramHandle}</span>
        </a>
      </div>
    </div>
  );
};
