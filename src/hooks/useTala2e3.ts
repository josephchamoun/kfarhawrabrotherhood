// useTala2e3.ts
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

export function useTala2e3() {
  const { users, loading, syncing, error, refetch } = useUsers();

  const tala2e3Users = users.filter((u) => isActiveInSection(u, 2));

  const withRoles = tala2e3Users.map((u) => ({
    ...u,
    tala2e3_roles: (u.sections ?? [])
      .filter((s) => s.pivot?.section_id === 2)
      .map((s) => ({
        id: s.pivot!.user_id,
        role_id: s.pivot!.role_id,
        start_date: s.pivot!.start_date ?? '',
        end_date: s.pivot!.end_date ?? null,
      })),
  }));

  const activeUsers   = withRoles.filter((u) => u.tala2e3_roles.some((r) => r.end_date === null));
  const inactiveUsers = withRoles.filter((u) => !u.tala2e3_roles.some((r) => r.end_date === null));

  return { activeUsers, inactiveUsers, loading, syncing, error, refetch };
}