import type { SpoolProfile, PrinterProfile, SavedCalculation, AppSettings, Project } from '../types';
import { DEFAULT_SETTINGS } from './defaults';

const KEYS = {
  SPOOLS: 'pfdm_spools',
  PRINTERS: 'pfdm_printers',
  HISTORY: 'pfdm_history',
  SETTINGS: 'pfdm_settings',
  PROJECTS: 'pfdm_projects',
  DRAFT: 'pfdm_draft',
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

function safeSet<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // localStorage quota exceeded or unavailable
    return false;
  }
}

export function isStorageAvailable(): boolean {
  try {
    const test = '__pfdm_test__';
    localStorage.setItem(test, '1');
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
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
  const raw = safeGet<SavedCalculation[]>(KEYS.HISTORY, []);
  // Миграция: старый формат projectId (string) → projectIds (string[])
  return raw.map((item: SavedCalculation & { projectId?: string }) => {
    if (item.projectId && !item.projectIds) {
      const { projectId, ...rest } = item;
      return { ...rest, projectIds: [projectId] };
    }
    return item;
  });
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

// ---- Projects ----

export function loadProjects(): Project[] {
  return safeGet<Project[]>(KEYS.PROJECTS, []);
}

export function saveProjects(projects: Project[]): void {
  safeSet(KEYS.PROJECTS, projects);
}

// ---- Draft (autosave) ----
import type { PrintCalculationInput } from '../types';

export function saveDraft(input: PrintCalculationInput): void {
  safeSet(KEYS.DRAFT, input);
}

export function loadDraft(): PrintCalculationInput | null {
  return safeGet<PrintCalculationInput | null>(KEYS.DRAFT, null);
}

export function clearDraft(): void {
  try { localStorage.removeItem(KEYS.DRAFT); } catch { /* ignore */ }
}

// ---- Export / Import ----

export interface BackupData {
  version: 1;
  exportedAt: string;
  spools: SpoolProfile[];
  printers: PrinterProfile[];
  history: SavedCalculation[];
  projects: Project[];
  settings: AppSettings;
}

export function exportAllData(
  spools: SpoolProfile[],
  printers: PrinterProfile[],
  history: SavedCalculation[],
  projects: Project[],
  settings: AppSettings,
): void {
  const backup: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    spools,
    printers,
    history,
    projects,
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
      projects: Array.isArray(data.projects) ? data.projects : [],
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
