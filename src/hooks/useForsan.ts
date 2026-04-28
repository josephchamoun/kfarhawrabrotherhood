import { useUsers } from './useUsers';
import type { User } from '../types';

const today = new Date().toISOString().split('T')[0];

const isActiveInSection = (user: User, sectionId: number) =>
  user.sections?.some(
    (s) =>
      s.pivot &&
      s.pivot.section_id === sectionId &&
      s.pivot.start_date != null &&
      s.pivot.start_date <= today &&
      (s.pivot.end_date == null || s.pivot.end_date >= today),
  );

export function useForsan() {
  const { users, loading, syncing, error, refetch } = useUsers();

  const forsanUsers = users.filter((u) => isActiveInSection(u, 3));

  const withRoles = forsanUsers.map((u) => ({
    ...u,
    forsan_roles: (u.sections ?? [])
      .filter((s) => s.pivot?.section_id === 3)
      .map((s) => ({
        id: s.pivot!.user_id,
        role_id: s.pivot!.role_id,
        start_date: s.pivot!.start_date ?? '',
        end_date: s.pivot!.end_date ?? null,
      })),
  }));

  const activeUsers   = withRoles.filter((u) => u.forsan_roles.some((r) => r.end_date === null));
  const inactiveUsers = withRoles.filter((u) => !u.forsan_roles.some((r) => r.end_date === null));

  return { activeUsers, inactiveUsers, loading, syncing, error, refetch };
}