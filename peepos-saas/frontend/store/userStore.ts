import { create } from 'zustand';
import { Student, Staff, ParentTutor, GenericUser } from '@/types';

interface UserStoreState {
  students: Student[];
  staff: Staff[];
  parents: ParentTutor[];
  allUsers: GenericUser[];
  setAllUsers: (users: GenericUser[]) => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  students: [],
  staff: [],
  parents: [],
  allUsers: [],
  setAllUsers: (newUsers) => {
    set({
      allUsers: newUsers,
      students: newUsers.filter((u): u is Student => 'studentCode' in u),
      staff: newUsers.filter((u): u is Staff => 'category' in u),
      parents: newUsers.filter((u): u is ParentTutor => 'relation' in u),
    });
  },
}));
