import { useAuth } from '@/contexts/AuthContext';

/**
 * Thin wrapper around AuthContext for admin role.
 * Kept for backwards compatibility; reads from shared auth state — no extra session calls.
 */
export function useAdminRole() {
  const { isAdmin, loading } = useAuth();
  return { isAdmin, loading };
}
