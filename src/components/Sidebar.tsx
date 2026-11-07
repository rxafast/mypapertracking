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
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-neutral-900/95 backdrop-blur-md border-r border-neutral-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-neutral-100 tracking-tight leading-tight">
                Paper Portal
              </h1>
              <span className="text-[11px] font-medium text-neutral-500">Rizwan's Workspace</span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Context Badge */}
        <div className="px-5 py-4 mx-4 my-4 rounded-2xl bg-neutral-950/50 border border-neutral-800">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-400 mb-1.5">
            <span>Academic Year</span>
            <span className="inline-flex items-center gap-1 text-[10px] bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded-md font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" /> {settings.academicYear}
            </span>
          </div>
          <p className="text-sm font-semibold text-neutral-200 truncate">{settings.primarySubject}</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
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
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-neutral-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs font-semibold rounded-lg font-mono ${
                      item.badgeColor || 'bg-neutral-800 text-neutral-400'
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
        <div className="p-4 border-t border-neutral-800/50 bg-neutral-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-xs text-neutral-300">
              R
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-neutral-200 truncate">Rizwan</p>
              <p className="text-[11px] text-neutral-500 truncate">Lecturer</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
