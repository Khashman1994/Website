'use client';
// components/SessionTimeout.tsx
import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const TIMEOUT_MS = 60 * 60 * 1000; // 1 hour inactivity

export function SessionTimeout() {
  const router   = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether this is a real close vs a refresh
  const isRefreshingRef = useRef(false);

  const logout = useCallback(async (reason: 'inactivity' | 'tab_close') => {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.clear();
    localStorage.removeItem('mena-lang');
    if (reason === 'inactivity') {
      router.replace('/login?reason=inactivity');
    }
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => logout('inactivity'), TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    resetTimer();

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));

    // ── Tab-close detection (NOT triggered by refresh) ────────────────────
    // Strategy: beforeunload fires for both refresh AND close.
    // visibilitychange fires immediately on refresh (tab stays in process).
    // If the page becomes hidden and stays hidden > 500ms, it's a real close.
    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Start a timer — if page comes back (refresh), cancel it
        closeTimer = setTimeout(() => {
          // Page stayed hidden → real tab close → sign out
          navigator.sendBeacon('/api/auth/signout');
        }, 500);
      } else {
        // Page became visible again → was a refresh, cancel the beacon
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (closeTimer) clearTimeout(closeTimer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetTimer]);

  return null;
}