'use client';
// components/ui/Toast.tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, X } from 'lucide-react';

interface ToastProps {
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
  onDismiss: () => void;
  duration?: number; // ms
}

export function Toast({ message, undoLabel, onUndo, onDismiss, duration = 5000 }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) { clearInterval(interval); onDismiss(); }
    }, 30);
    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative overflow-hidden bg-neutral-900 text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-sm"
    >
      {/* Progress bar at bottom */}
      <div
        className="absolute bottom-0 left-0 h-0.5 bg-primary-500 transition-none"
        style={{ width: `${progress}%` }}
      />

      {/* Icon */}
      <div className="w-7 h-7 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
        <Check className="w-3.5 h-3.5 text-primary-400" />
      </div>

      {/* Text */}
      <span className="text-sm font-medium flex-grow">{message}</span>

      {/* Undo */}
      {onUndo && undoLabel && (
        <button
          onClick={() => { onUndo(); onDismiss(); }}
          className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors flex-shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          {undoLabel}
        </button>
      )}

      {/* Close */}
      <button
        onClick={onDismiss}
        className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// ── ToastContainer — place once at the bottom of the layout ──────────────────
interface ToastItem {
  id: string;
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            undoLabel={toast.undoLabel}
            onUndo={toast.onUndo}
            onDismiss={() => onDismiss(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}