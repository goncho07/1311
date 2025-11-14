import { GenericUser, Student, Staff, ParentTutor, UserRole, UserLevel } from '@/types';

// --- TYPE GUARDS ---
export const isStudent = (user: GenericUser | null | undefined): user is Student => !!user && 'studentCode' in user;
export const isStaff = (user: GenericUser | null | undefined): user is Staff => !!user && 'category' in user;
export const isParent = (user: GenericUser | null | undefined): user is ParentTutor => !!user && 'relation' in user;

// --- GETTERS ---
export const getUserType = (user: GenericUser | null): UserRole | 'Personal' | 'N/A' => {
    if (!user) return 'N/A';
    if (isStudent(user)) return 'Estudiante';
    if (isParent(user)) return 'Apoderado';
    if (isStaff(user)) return user.category;
    return 'N/A';
};

export const getRoleDisplay = (user: GenericUser) => {
    if (isStudent(user)) return 'Estudiante';
    if (isParent(user)) return 'Apoderado';
    if (isStaff(user)) return user.role.replace('_', '-');
    return 'N/A';
};

export const getLevel = (user: GenericUser): UserLevel => {
  if (isStudent(user)) {
    if (user.grade.toLowerCase().includes('grado')) return 'Primaria';
    if (user.grade.toLowerCase().includes('años')) return 'Inicial';
    return 'Secundaria';
  }
  if (isStaff(user)) {
    if (user.role.includes('Inicial')) return 'Inicial';
    if (user.role.includes('Primaria')) return 'Primaria';
    if (user.role.includes('Secundaria')) return 'Secundaria';
  }
  return 'N/A';
};

// --- FORMATTERS ---
export const formatUserName = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
