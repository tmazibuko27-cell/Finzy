import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/features/auth/AuthProvider';
import { useLocalStore } from '@/lib/localStore';
import { initPurchases, getIsProFromEntitlements, isPurchasesConfigured } from '@/lib/purchases';

type ProContextValue = {
  isPro: boolean;
  isPurchasesConfigured: boolean;
};

const ProContext = createContext<ProContextValue | null>(null);

export function ProProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const isPro = useLocalStore((s) => s.isPro);
  const setIsPro = useLocalStore((s) => s.setIsPro);

  useEffect(() => {
    initPurchases(session?.user.id)
      .then(() => getIsProFromEntitlements())
      .then(setIsPro)
      .catch(() => {
        // Purchases unavailable (not configured, offline, etc.) — keep last known value.
      });
  }, [session?.user.id, setIsPro]);

  return <ProContext.Provider value={{ isPro, isPurchasesConfigured }}>{children}</ProContext.Provider>;
}

export function usePro(): ProContextValue {
  const ctx = useContext(ProContext);
  if (!ctx) throw new Error('usePro must be used within a ProProvider');
  return ctx;
}
