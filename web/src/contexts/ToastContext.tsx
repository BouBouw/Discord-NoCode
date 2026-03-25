import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Individual toast ─────────────────────────────────────────────────────────

const STYLES: Record<ToastType, { bg: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-600',
    icon: <CheckCircle2 className="w-4 h-4 shrink-0" />,
  },
  error: {
    bg: 'bg-red-600',
    icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
  },
  warning: {
    bg: 'bg-amber-500',
    icon: <AlertTriangle className="w-4 h-4 shrink-0" />,
  },
  info: {
    bg: 'bg-blue-600',
    icon: <Info className="w-4 h-4 shrink-0" />,
  },
};

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const s = STYLES[item.type];
  return (
    <div
      className={`flex items-start gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white max-w-sm pointer-events-auto animate-slide-in ${s.bg}`}
      style={{ wordBreak: 'break-word' }}
    >
      {s.icon}
      <span className="flex-1">{item.message}</span>
      <button
        onClick={onDismiss}
        className="ml-1 opacity-70 hover:opacity-100 shrink-0 mt-px"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack — bottom-right */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end pointer-events-none"
        aria-live="polite"
      >
        {toasts.map(item => (
          <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.toast;
}
