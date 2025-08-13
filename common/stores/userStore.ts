import { observable } from '@legendapp/state';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';
import { I18nManager } from 'react-native';

export type LanguageCode = 'en' | 'ar';

type UserProfile = {
  id: string;
  name: string;
  email: string;
};

type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
};

type UserStoreShape = {
  language: LanguageCode;
  favorites: string[]; // event IDs for current user
  profile: UserProfile | null;
  isAuthenticated: boolean;
  biometricsEnabled?: boolean;
};

const STORAGE_KEY = 'citypulse:userStore:v1';

export const userStore = observable<UserStoreShape>({
  language: 'en',
  favorites: [],
  profile: null,
  isAuthenticated: false,
});

const FAV_KEY_PREFIX = 'citypulse:favorites:';
const USERS_KEY = 'citypulse:users:v1';
const BIOMETRIC_USER_KEY = 'citypulse:biometricUser';

function getCurrentUserId(): string {
  const profile = userStore.profile.get();
  return profile?.id ?? 'guest';
}

async function loadFavoritesForUser(userId: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(`${FAV_KEY_PREFIX}${userId}`);
    const favs: string[] = raw ? JSON.parse(raw) : [];
    userStore.favorites.set(Array.isArray(favs) ? favs : []);
  } catch {
    userStore.favorites.set([]);
  }
}

async function saveFavoritesForUser(userId: string, favorites: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`${FAV_KEY_PREFIX}${userId}`, JSON.stringify(favorites));
  } catch {
    // ignore
  }
}

async function getUsersMap(): Promise<Record<string, StoredUser>> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredUser>) : {};
  } catch {
    return {};
  }
}

async function setUsersMap(map: Record<string, StoredUser>): Promise<void> {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

function inferNameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'User';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function normalizeEmail(email: string): string {
  return (email || '').trim().toLowerCase();
}

export async function loadUserStoreFromStorage(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UserStoreShape>;
      if (parsed.language) userStore.language.set(parsed.language);
      if (typeof parsed.isAuthenticated === 'boolean')
        userStore.isAuthenticated.set(parsed.isAuthenticated);
      if (parsed.profile) userStore.profile.set(parsed.profile as UserProfile);
    }
    // If a saved profile exists, reconcile it with stored users map to ensure name persists
    const currentProfile = userStore.profile.get();
    if (currentProfile) {
      const users = await getUsersMap();
      const found = users[currentProfile.email];
      if (found && found.name !== currentProfile.name) {
        userStore.profile.set({ id: found.id, name: found.name, email: found.email });
      }
    }
    // Load favorites for current user (or guest)
    await loadFavoritesForUser(getCurrentUserId());
  } catch {
    // ignore
  }
}

export async function persistUserStoreToStorage(): Promise<void> {
  const snapshot: UserStoreShape = {
    language: userStore.language.get(),
    favorites: [],
    profile: userStore.profile.get(),
    isAuthenticated: userStore.isAuthenticated.get(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function toggleFavorite(eventId: string) {
  const list = userStore.favorites.get();
  const exists = list.includes(eventId);
  const next = exists ? list.filter((id) => id !== eventId) : [...list, eventId];
  userStore.favorites.set(next);
  const uid = getCurrentUserId();
  void saveFavoritesForUser(uid, next);
}

export async function setLanguage(lang: LanguageCode) {
  userStore.language.set(lang);
  try {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(lang === 'ar');
  } catch {}
  await persistUserStoreToStorage();
  // Reload app so RTL applies immediately
  try {
    await Updates.reloadAsync();
  } catch {}
}

export async function loginUser(email: string, password: string): Promise<boolean> {
  const users = await getUsersMap();
  const key = normalizeEmail(email);
  const u = users[key];
  if (!u) {
    return false;
  }
  if (u.password !== password) {
    return false;
  }
  userStore.isAuthenticated.set(true);
  userStore.profile.set({ id: u.id, name: u.name, email: u.email });
  await persistUserStoreToStorage();
  await loadFavoritesForUser(u.id);
  return true;
}

export function mockLogout() {
  userStore.isAuthenticated.set(false);
  userStore.profile.set(null);
  userStore.favorites.set([]);
  void persistUserStoreToStorage();
}

export async function registerUser(name: string, email: string, password: string) {
  const users = await getUsersMap();
  const key = normalizeEmail(email);
  const existing = users[key];
  const id = existing?.id ?? `u_${Date.now()}`;
  users[key] = { id, name, email: key, password };
  await setUsersMap(users);
  userStore.profile.set({ id, name, email: key });
  userStore.isAuthenticated.set(true);
  userStore.favorites.set([]);
  await persistUserStoreToStorage();
}

export async function enableBiometricsForCurrentUser(): Promise<boolean> {
  const profile = userStore.profile.get();
  if (!profile) return false;
  try {
    await SecureStore.setItemAsync(BIOMETRIC_USER_KEY, normalizeEmail(profile.email));
    // Verify immediately
    const linked = await getBiometricLinkedEmail();
    return linked === normalizeEmail(profile.email);
  } catch {
    return false;
  }
}

export async function getBiometricLinkedEmail(): Promise<string | null> {
  try {
    const v = await SecureStore.getItemAsync(BIOMETRIC_USER_KEY);
    return v ? normalizeEmail(v) : null;
  } catch {
    return null;
  }
}

export async function biometricLoginFromSecureLink(): Promise<boolean> {
  const linked = await getBiometricLinkedEmail();
  if (!linked) return false;
  const users = await getUsersMap();
  const u = users[linked];
  if (!u) return false;
  userStore.isAuthenticated.set(true);
  userStore.profile.set({ id: u.id, name: u.name, email: u.email });
  await persistUserStoreToStorage();
  await loadFavoritesForUser(u.id);
  return true;
}

export async function disableBiometrics(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_USER_KEY);
  } catch {}
}

export async function isBiometricsLinkedForCurrentUser(): Promise<boolean> {
  const profile = userStore.profile.get();
  if (!profile) return false;
  const linked = await getBiometricLinkedEmail();
  return linked === normalizeEmail(profile.email);
}


