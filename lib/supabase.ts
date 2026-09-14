import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { env, isSupabaseConfigured } from './env';

/**
 * Auth tokens go in SecureStore (Keychain-backed) on native; SecureStore has
 * no web implementation, so web falls back to AsyncStorage. Never store
 * session tokens in plain AsyncStorage on native.
 */
const secureStorageAdapter: SupportedStorage = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

const storage = Platform.OS === 'web' ? AsyncStorage : secureStorageAdapter;

// Not generic over `Database` yet — regenerate real types once a project
// exists (`supabase gen types typescript --project-id <ref>`) and swap this
// to `createClient<Database>(...)`. A placeholder Database type would just
// make every `.rpc()`/`.from()` call falsely appear untyped-safe.
export const supabase = isSupabaseConfigured
  ? createClient(env!.EXPO_PUBLIC_SUPABASE_URL, env!.EXPO_PUBLIC_SUPABASE_ANON_KEY, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
