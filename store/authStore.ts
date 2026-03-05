import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  sessdata: string | null;
  uid: string | null;
  username: string | null;
  isLoggedIn: boolean;
  login: (sessdata: string, uid: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  sessdata: null,
  uid: null,
  username: null,
  isLoggedIn: false,

  login: async (sessdata, uid, username) => {
    await AsyncStorage.multiSet([
      ['SESSDATA', sessdata],
      ['UID', uid],
      ['USERNAME', username ?? ''],
    ]);
    set({ sessdata, uid, username: username ?? null, isLoggedIn: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['SESSDATA', 'UID', 'USERNAME']);
    set({ sessdata: null, uid: null, username: null, isLoggedIn: false });
  },

  restore: async () => {
    const sessdata = await AsyncStorage.getItem('SESSDATA');
    const uid = await AsyncStorage.getItem('UID');
    const username = await AsyncStorage.getItem('USERNAME');
    if (sessdata) {
      set({ sessdata, uid, username, isLoggedIn: true });
    }
  },
}));
