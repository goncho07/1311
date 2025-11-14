import { create } from 'zustand';
import { ActivityLog, CalendarEvent } from '@/types';
import { gradesAndSections } from '@/services/mocks';

interface DataStoreState {
  activityLogs: ActivityLog[];
  events: CalendarEvent[];
  gradesAndSections: typeof gradesAndSections;
  setActivityLogs: (logs: ActivityLog[]) => void;
  setEvents: (events: CalendarEvent[]) => void;
}

export const useDataStore = create<DataStoreState>((set) => ({
  activityLogs: [],
  events: [],
  gradesAndSections: gradesAndSections,
  setActivityLogs: (logs) => set({ activityLogs: logs }),
  setEvents: (events) => set({ events }),
}));