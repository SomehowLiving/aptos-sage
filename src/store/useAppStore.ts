import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  Token, 
  Pool, 
  Vault, 
  ChatMessage, 
  ChatSession, 
  WalletState, 
  AppState,
  SandboxSimulation 
} from '@/types';

interface AppStore {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Wallet state
  wallet: WalletState;
  setWallet: (wallet: WalletState) => void;

  // App state
  appState: AppState;
  setAppState: (state: Partial<AppState>) => void;

  // Chat state
  currentSession: ChatSession | null;
  setCurrentSession: (session: ChatSession | null) => void;
  addMessage: (message: ChatMessage) => void;
  clearSession: () => void;

  // DeFi data
  tokens: Token[];
  pools: Pool[];
  vaults: Vault[];
  setTokens: (tokens: Token[]) => void;
  setPools: (pools: Pool[]) => void;
  setVaults: (vaults: Vault[]) => void;
  addToken: (token: Token) => void;
  addPool: (pool: Pool) => void;
  addVault: (vault: Vault) => void;

  // Sandbox state
  simulations: SandboxSimulation[];
  setSimulations: (simulations: SandboxSimulation[]) => void;
  addSimulation: (simulation: SandboxSimulation) => void;
  updateSimulation: (id: string, updates: Partial<SandboxSimulation>) => void;
  removeSimulation: (id: string) => void;

  // UI state
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),

      // Wallet state
      wallet: {
        connected: false,
        address: undefined,
        balance: undefined,
        network: undefined,
      },
      setWallet: (wallet) => set({ wallet }),

      // App state
      appState: {
        currentView: 'chat',
        selectedToken: undefined,
        selectedPool: undefined,
        selectedVault: undefined,
        isLoading: false,
        error: undefined,
      },
      setAppState: (state) => set((prev) => ({ 
        appState: { ...prev.appState, ...state } 
      })),

      // Chat state
      currentSession: null,
      setCurrentSession: (session) => set({ currentSession: session }),
      addMessage: (message) => set((state) => {
        if (!state.currentSession) {
          const newSession: ChatSession = {
            id: `session_${Date.now()}`,
            userId: state.user?.id || 'anonymous',
            messages: [message],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          return { currentSession: newSession };
        }

        const updatedSession = {
          ...state.currentSession,
          messages: [...state.currentSession.messages, message],
          updatedAt: new Date(),
        };

        return { currentSession: updatedSession };
      }),
      clearSession: () => set({ currentSession: null }),

      // DeFi data
      tokens: [],
      pools: [],
      vaults: [],
      setTokens: (tokens) => set({ tokens }),
      setPools: (pools) => set({ pools }),
      setVaults: (vaults) => set({ vaults }),
      addToken: (token) => set((state) => ({ 
        tokens: [...state.tokens, token] 
      })),
      addPool: (pool) => set((state) => ({ 
        pools: [...state.pools, pool] 
      })),
      addVault: (vault) => set((state) => ({ 
        vaults: [...state.vaults, vault] 
      })),

      // Sandbox state
      simulations: [],
      setSimulations: (simulations) => set({ simulations }),
      addSimulation: (simulation) => set((state) => ({ 
        simulations: [...state.simulations, simulation] 
      })),
      updateSimulation: (id, updates) => set((state) => ({
        simulations: state.simulations.map(sim => 
          sim.id === id ? { ...sim, ...updates } : sim
        )
      })),
      removeSimulation: (id) => set((state) => ({
        simulations: state.simulations.filter(sim => sim.id !== id)
      })),

      // UI state
      isLoading: false,
      error: null,
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'aptos-assistant-store',
      partialize: (state) => ({
        user: state.user,
        wallet: state.wallet,
        tokens: state.tokens,
        pools: state.pools,
        vaults: state.vaults,
        simulations: state.simulations,
      }),
    }
  )
);
