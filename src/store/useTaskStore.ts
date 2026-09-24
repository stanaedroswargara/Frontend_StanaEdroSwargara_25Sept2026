import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, Column, FilterState, LabelType, PriorityType, ChecklistItem, Attachment, Assignee } from './types';
import { DEFAULT_COLUMNS, DEFAULT_TASKS, TEAM_MEMBERS } from '../data/seedData';


interface TaskStore {
  columns: Column[];
  tasks: Task[];
  teamMembers: Assignee[];
  boardName: string;
  currentUser: Assignee;
  filter: FilterState;

  // Board & User actions
  setBoardName: (name: string) => void;
  setCurrentUser: (user: Assignee) => void;

  // Column actions
  addColumn: (title: string) => void;
  updateColumn: (id: string, title: string) => void;
  deleteColumn: (id: string) => void;

  // Task actions
  addTask: (columnId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, toColumnId: string, newPosition?: number) => void;
  reorderTask: (columnId: string, activeId: string, overId: string) => void;

  // Checklist
  addChecklistItem: (taskId: string, text: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  deleteChecklistItem: (taskId: string, itemId: string) => void;

  // Team Member / Employee actions
  addTeamMember: (member: Omit<Assignee, 'id'>) => void;
  updateTeamMember: (id: string, updates: Partial<Assignee>) => void;
  deleteTeamMember: (id: string) => void;

  // Filter actions
  setFilter: (filter: Partial<FilterState>) => void;
  clearFilter: () => void;

  // Selectors
  getFilteredTasks: (columnId: string) => Task[];
  getTaskById: (id: string) => Task | undefined;
  getAssigneeById: (id: string) => Assignee | undefined;
}

const defaultFilter: FilterState = {
  search: '',
  assignees: [],
  labels: [],
  dueDateFrom: null,
  dueDateTo: null,
};

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      columns: DEFAULT_COLUMNS,
      tasks: DEFAULT_TASKS,
      teamMembers: TEAM_MEMBERS,
      boardName: 'Adhivasindo',
      currentUser: TEAM_MEMBERS[0],
      filter: defaultFilter,

      setBoardName: (name) => set({ boardName: name }),
      setCurrentUser: (user) => set({ currentUser: user }),

      addColumn: (title) =>
        set((state) => ({
          columns: [
            ...state.columns,
            {
              id: generateId(),
              title,
              color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
              position: state.columns.length,
            },
          ],
        })),

      updateColumn: (id, title) =>
        set((state) => ({
          columns: state.columns.map((c) => (c.id === id ? { ...c, title } : c)),
        })),

      deleteColumn: (id) =>
        set((state) => ({
          columns: state.columns.filter((c) => c.id !== id),
          tasks: state.tasks.filter((t) => t.columnId !== id),
        })),

      addTask: (columnId, taskData) => {
        const state = get();
        const columnTasks = state.tasks.filter((t) => t.columnId === columnId);
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          columnId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          position: columnTasks.length,
          creator: taskData.creator || state.currentUser,
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        return newTask;
      },

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

      moveTask: (taskId, toColumnId, newPosition) =>
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          if (!task) return state;
          const targetTasks = state.tasks.filter(
            (t) => t.columnId === toColumnId && t.id !== taskId
          );
          const pos = newPosition !== undefined ? newPosition : targetTasks.length;
          return {
            tasks: state.tasks.map((t) =>
              t.id === taskId
                ? { ...t, columnId: toColumnId, position: pos, updatedAt: new Date().toISOString() }
                : t
            ),
          };
        }),

      reorderTask: (columnId, activeId, overId) =>
        set((state) => {
          const columnTasks = state.tasks
            .filter((t) => t.columnId === columnId)
            .sort((a, b) => a.position - b.position);
          const activeIdx = columnTasks.findIndex((t) => t.id === activeId);
          const overIdx = columnTasks.findIndex((t) => t.id === overId);
          if (activeIdx === -1 || overIdx === -1) return state;
          const reordered = [...columnTasks];
          const [moved] = reordered.splice(activeIdx, 1);
          reordered.splice(overIdx, 0, moved);
          const updatedTasks = state.tasks.map((t) => {
            const idx = reordered.findIndex((r) => r.id === t.id);
            if (idx !== -1) return { ...t, position: idx };
            return t;
          });
          return { tasks: updatedTasks };
        }),

      addChecklistItem: (taskId, text) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: [
                    ...t.checklist,
                    { id: generateId(), text, completed: false },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      toggleChecklistItem: (taskId, itemId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: t.checklist.map((c) =>
                    c.id === itemId ? { ...c, completed: !c.completed } : c
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      deleteChecklistItem: (taskId, itemId) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  checklist: t.checklist.filter((c) => c.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        })),

      addTeamMember: (memberData) =>
        set((state) => ({
          teamMembers: [
            ...state.teamMembers,
            {
              ...memberData,
              id: `emp-${Date.now()}`,
            },
          ],
        })),

      updateTeamMember: (id, updates) =>
        set((state) => ({
          teamMembers: state.teamMembers.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      deleteTeamMember: (id) =>
        set((state) => ({
          teamMembers: state.teamMembers.filter((m) => m.id !== id),
          tasks: state.tasks.map((t) => ({
            ...t,
            assignees: t.assignees.filter((aId) => aId !== id),
          })),
          filter: {
            ...state.filter,
            assignees: state.filter.assignees.filter((aId) => aId !== id),
          },
        })),

      setFilter: (filter) =>
        set((state) => ({ filter: { ...state.filter, ...filter } })),

      clearFilter: () => set({ filter: defaultFilter }),

      getFilteredTasks: (columnId) => {
        const { tasks, filter } = get();
        let result = tasks
          .filter((t) => t.columnId === columnId)
          .sort((a, b) => a.position - b.position);

        if (filter.search) {
          const q = filter.search.toLowerCase();
          result = result.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.description.toLowerCase().includes(q)
          );
        }
        if (filter.assignees.length > 0) {
          result = result.filter((t) =>
            filter.assignees.some((a) => t.assignees.includes(a))
          );
        }
        if (filter.labels.length > 0) {
          result = result.filter((t) => filter.labels.includes(t.label));
        }
        if (filter.dueDateFrom) {
          result = result.filter(
            (t) => t.dueDate && t.dueDate >= filter.dueDateFrom!
          );
        }
        if (filter.dueDateTo) {
          result = result.filter(
            (t) => t.dueDate && t.dueDate <= filter.dueDateTo!
          );
        }
        return result;
      },

      getTaskById: (id) => get().tasks.find((t) => t.id === id),

      getAssigneeById: (id) => get().teamMembers.find((m) => m.id === id),
    }),
    {
      name: 'kanban-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return {
            ...persistedState,
            tasks: DEFAULT_TASKS,
            teamMembers: TEAM_MEMBERS,
          };
        }
        return persistedState as TaskStore;
      },
    }
  )
);
