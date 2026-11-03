import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Hook untuk mengecek apakah komponen telah selesai dihidrasi di sisi client (browser).
 * Aman untuk SSR & React 19 / Next.js 16 tanpa memicu error `react-hooks/set-state-in-effect`.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
