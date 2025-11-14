import { create } from 'zustand';
import * as api from '@/services/api';
// FIX: Import `Task` from the central types file.
import { Task } from '@/types';

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  toggleTaskStatus: (taskId: string, currentStatus: Task['status']) => Promise<void>;
  addTask: (text: string, priority: Task['priority']) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  toggleTaskStatus: async (taskId, currentStatus) => {
    try {
      const updatedTask = await api.toggleTaskStatus(taskId, currentStatus);
      if (updatedTask) {
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, ...updatedTask } : task)),
        }));
      }
    } catch (error) {
      console.error("Error updating task status: ", error);
    }
  },
  addTask: async (text, priority) => {
    if (!text.trim()) return;
    try {
      const newTask = await api.createTask(text, priority);
      if (newTask) {
        set((state) => ({
// FIX: Removed 'as Task' cast, as the API function is now correctly typed.
          tasks: [newTask, ...state.tasks],
        }));
      }
    } catch (error) {
      console.error("Error adding task: ", error);
    }
  },
}));