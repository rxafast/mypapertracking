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
    <header className="h-20 bg-neutral-900/50 backdrop-blur-xl border-b border-neutral-800 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger & Personal Portal Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base font-bold text-neutral-100 truncate tracking-tight">
            Paper Portal
          </h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="text-neutral-400 font-medium truncate">{settings.primarySubject}</span>
          </div>
        </div>
      </div>

      {/* Middle/Right Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick Academic Session & Year Filter Pill Toggles */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-neutral-950/50 rounded-full border border-neutral-800 text-xs">
          <button
            onClick={() => handleSessionChange('Fall')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              settings.activeSession === 'Fall'
                ? 'bg-neutral-800 text-white shadow-inner'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Fall
          </button>
          <button
            onClick={() => handleSessionChange('Spring')}
            className={`px-4 py-1.5 rounded-full font-medium transition-all ${
              settings.activeSession === 'Spring'
                ? 'bg-neutral-800 text-white shadow-inner'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Spring
          </button>
          <div className="h-4 w-px bg-neutral-800" />
          <select
            value={settings.academicYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="bg-transparent text-neutral-300 font-mono font-medium px-3 rounded-full cursor-pointer focus:outline-none"
          >
            <option value="2025" className="bg-neutral-900">2025</option>
            <option value="2026" className="bg-neutral-900">2026</option>
            <option value="2027" className="bg-neutral-900">2027</option>
          </select>
        </div>

        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-700 transition-all text-xs"
          title="Search programs, subjects, papers"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search</span>
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-2xl z-50 p-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                <h3 className="text-sm font-bold text-neutral-100">Alerts</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-xs text-neutral-500 hover:text-neutral-300"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto py-2 space-y-2">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-neutral-600 text-xs">
                    No pending alerts!
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-4 rounded-2xl border text-xs cursor-pointer transition-colors ${
                        n.read
                          ? 'bg-neutral-950/50 border-neutral-800 text-neutral-500'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-neutral-100">{n.title}</span>
                      </div>
                      <p className="mt-1 text-neutral-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          title="Portal Preferences"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
