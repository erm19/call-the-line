import { create } from 'zustand';
import { Session } from '@domain/entities/Session';

/**
 * Zustand store for session list/detail state.
 * Standard shape: { items, activeItem, isLoading, error, set*, reset }.
 */
export interface SessionStoreState {
  items: Session[];
  activeItem: Session | null;
  isLoading: boolean;
  error: string | null;
  setItems: (items: Session[]) => void;
  setActiveItem: (item: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  items: [] as Session[],
  activeItem: null as Session | null,
  isLoading: false,
  error: null as string | null,
};

export const useSessionStore = create<SessionStoreState>(set => ({
  ...initialState,
  setItems: items => set({ items }),
  setActiveItem: activeItem => set({ activeItem }),
  setIsLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
  reset: () => set(initialState),
}));
