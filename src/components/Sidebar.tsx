import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  GraduationCap,
  FileCheck2,
  Clock,
  History,
  BarChart3,
  Settings,
  X,
  BookOpen,
  Sparkles,
  User,
} from 'lucide-react';
import { AppSettings } from '../types';

export type NavTab =
  | 'dashboard'
  | 'import'
  | 'classes'
  | 'papers'
  | 'pending'
  | 'history'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingCount: number;
  settings: AppSettings;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingCount,
  settings,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'import' as NavTab, label: 'Import Excel', icon: FileSpreadsheet },
    { id: 'classes' as NavTab, label: 'Programs & Classes', icon: GraduationCap },
    { id: 'papers' as NavTab, label: 'Paper Management', icon: FileCheck2 },
    {
      id: 'pending' as NavTab,
      label: 'Pending Papers',
      icon: Clock,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    { id: 'history' as NavTab, label: 'Paper History', icon: History },
    { id: 'reports' as NavTab, label: 'Reports', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-100 tracking-tight leading-tight">
                Rizwan's Paper Portal
              </h1>
              <span className="text-[11px] font-medium text-slate-400">Class Paper Tracking</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Context Badge */}
        <div className="px-5 py-3 mx-4 my-3 rounded-xl bg-slate-900/90 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-1">
            <span>Active Academic Year</span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded font-mono">
              <Sparkles className="w-3 h-3" /> {settings.academicYear}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-200 truncate">{settings.primarySubject}</p>
          <p className="text-[11px] text-amber-400 font-medium truncate mt-1">
            ⚡ Fall & Spring Cohorts Tracked Separately
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full font-mono ${
                      item.badgeColor || 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User / Lecturer Footer Profile */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center font-bold text-xs text-white font-mono">
              R
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">Rizwan</p>
              <p className="text-[11px] text-slate-400 truncate">Personal Portal</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
