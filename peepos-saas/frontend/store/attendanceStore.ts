import { create } from 'zustand';

interface AttendanceStoreState {
  attendanceData: {
    kpis: any[];
    chartData: any[];
    alerts: any[];
  };
  isAttendanceLoading: boolean;
  setAttendanceData: (data: any) => void;
  setIsAttendanceLoading: (loading: boolean) => void;
}

export const useAttendanceStore = create<AttendanceStoreState>((set) => ({
  attendanceData: { kpis: [], chartData: [], alerts: [] },
  isAttendanceLoading: true,
  setAttendanceData: (data) => set({ attendanceData: data }),
  setIsAttendanceLoading: (loading) => set({ isAttendanceLoading: loading }),
}));
