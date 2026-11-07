import React, { useState } from 'react';
import { Menu, Search, Bell, Settings, Filter, CheckCircle2, Clock, AlertTriangle, X, User } from 'lucide-react';
import { AcademicSession, AppSettings, NotificationItem } from '../types';

interface TopHeaderProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onToggleMobileSidebar: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenSearch,
  onOpenSettings,
  onToggleMobileSidebar,
  notifications,
  onMarkNotificationRead,
  onClearNotifications,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSessionChange = (session: AcademicSession) => {
    onUpdateSettings({ ...settings, activeSession: session });
  };

  const handleYearChange = (year: string) => {
    onUpdateSettings({ ...settings, academicYear: year });
  };

  return (
    <header className="h-18 bg-slate-900/95 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger & Personal Portal Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate tracking-tight">
            Rizwan's Personal Class Paper Portal
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline text-indigo-400 font-medium">ICT & Course Paper Tracker</span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="text-slate-300 font-medium truncate">{settings.primarySubject}</span>
          </div>
        </div>
      </div>

      {/* Middle/Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Academic Session & Year Filter Pill Toggles */}
        <div className="hidden md:flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80 text-xs">
          <button
            onClick={() => handleSessionChange('Fall')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              settings.activeSession === 'Fall'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Fall Cohort
          </button>
          <button
            onClick={() => handleSessionChange('Spring')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              settings.activeSession === 'Spring'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spring Cohort
          </button>
          <div className="h-3.5 w-px bg-slate-800 my-auto mx-0.5" />
          <select
            value={settings.academicYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="bg-transparent text-slate-200 font-mono font-medium px-2 py-0.5 rounded cursor-pointer focus:outline-none"
          >
            <option value="2025" className="bg-slate-900">2025</option>
            <option value="2026" className="bg-slate-900">2026</option>
            <option value="2027" className="bg-slate-900">2027</option>
          </select>
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all text-xs"
          title="Search programs, subjects, papers"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">Paper Alerts & Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded-full font-mono">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto py-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-400" />
                    No pending alerts! All papers are up to date.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-slate-950/40 border-slate-800/50 text-slate-400'
                          : 'bg-slate-800/60 border-indigo-500/30 text-slate-200 font-medium'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-100">{n.title}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Setup / Settings Icon Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Portal Preferences"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
