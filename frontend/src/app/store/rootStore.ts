import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Root Store Interface
interface RootStore {
  // App state
  initialized: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// Initial state
const initialState = {
  initialized: false,
  loading: false,
  error: null,
};

// Root store
export const useRootStore = create<RootStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        // Actions
        setInitialized: (initialized) => 
          set({ initialized }, false, 'setInitialized'),
        
        setLoading: (loading) => 
          set({ loading }, false, 'setLoading'),
        
        setError: (error) => 
          set({ error }, false, 'setError'),
        
        reset: () => 
          set(initialState, false, 'reset'),
      }),
      {
        name: 'rsms-root-store',
        partialize: (state) => ({
          initialized: state.initialized,
        }),
      }
    ),
    { name: 'RootStore' }
  )
);