import type { SpoolProfile, PrinterProfile, SavedCalculation, AppSettings } from '../types';
import { DEFAULT_SETTINGS } from './defaults';

const KEYS = {
  SPOOLS: 'pfdm_spools',
  PRINTERS: 'pfdm_printers',
  HISTORY: 'pfdm_history',
  SETTINGS: 'pfdm_settings',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage quota exceeded or unavailable
  }
}

// ---- Spool Profiles ----

export function loadSpools(): SpoolProfile[] {
  return safeGet<SpoolProfile[]>(KEYS.SPOOLS, []);
}

export function saveSpools(spools: SpoolProfile[]): void {
  safeSet(KEYS.SPOOLS, spools);
}

// ---- Printer Profiles ----

export function loadPrinters(): PrinterProfile[] {
  return safeGet<PrinterProfile[]>(KEYS.PRINTERS, []);
}

export function savePrinters(printers: PrinterProfile[]): void {
  safeSet(KEYS.PRINTERS, printers);
}

// ---- History ----

export function loadHistory(): SavedCalculation[] {
  return safeGet<SavedCalculation[]>(KEYS.HISTORY, []);
}

export function saveHistory(history: SavedCalculation[]): void {
  safeSet(KEYS.HISTORY, history);
}

// ---- Settings ----

export function loadSettings(): AppSettings {
  return { ...DEFAULT_SETTINGS, ...safeGet<Partial<AppSettings>>(KEYS.SETTINGS, {}) };
}

export function saveSettings(settings: AppSettings): void {
  safeSet(KEYS.SETTINGS, settings);
}

// ---- Export / Import ----

export interface BackupData {
  version: 1;
  exportedAt: string;
  spools: SpoolProfile[];
  printers: PrinterProfile[];
  history: SavedCalculation[];
  settings: AppSettings;
}

export function exportAllData(
  spools: SpoolProfile[],
  printers: PrinterProfile[],
  history: SavedCalculation[],
  settings: AppSettings,
): void {
  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    spools,
    printers,
    history,
    settings,
  };
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `pricefdm-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseBackup(json: string): BackupData | null {
  try {
    const data = JSON.parse(json) as BackupData;
    if (data.version !== 1) return null;
    return {
      version: 1,
      exportedAt: data.exportedAt ?? '',
      spools: Array.isArray(data.spools) ? data.spools : [],
      printers: Array.isArray(data.printers) ? data.printers : [],
      history: Array.isArray(data.history) ? data.history : [],
      settings: data.settings ?? {},
    } as BackupData;
  } catch {
    return null;
  }
}

// ---- ID generation ----

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
