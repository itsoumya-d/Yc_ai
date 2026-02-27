import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SkinCheck, HealthCorrelation, UserProfile } from '@/types/database';

const KEYS = {
  CHECKS: 'auracheck-skin-checks',
  CORRELATIONS: 'auracheck-correlations',
  PROFILE: 'auracheck-profile',
};

export async function getSkinChecks(): Promise<SkinCheck[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CHECKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveSkinCheck(check: SkinCheck): Promise<void> {
  const checks = await getSkinChecks();
  const idx = checks.findIndex((c) => c.id === check.id);
  if (idx >= 0) {
    checks[idx] = check;
  } else {
    checks.unshift(check);
  }
  await AsyncStorage.setItem(KEYS.CHECKS, JSON.stringify(checks));
}

export async function getHealthCorrelations(): Promise<HealthCorrelation[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CORRELATIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveHealthCorrelation(entry: HealthCorrelation): Promise<void> {
  const entries = await getHealthCorrelations();
  const idx = entries.findIndex((e) => e.date === entry.date);
  if (idx >= 0) {
    entries[idx] = entry;
  } else {
    entries.unshift(entry);
  }
  await AsyncStorage.setItem(KEYS.CORRELATIONS, JSON.stringify(entries));
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
