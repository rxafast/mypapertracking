import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyles =
    toast.type === 'success'
      ? 'bg-neutral-900/50 backdrop-blur-md border-emerald-500/40 text-emerald-300'
      : toast.type === 'error'
      ? 'bg-neutral-900/50 backdrop-blur-md border-rose-500/40 text-rose-300'
      : 'bg-neutral-900/50 backdrop-blur-md border-indigo-500/40 text-indigo-300';

  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 ${bgStyles}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium text-slate-100 truncate">{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-md"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
