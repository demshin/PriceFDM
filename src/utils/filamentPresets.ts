import JSZip from 'jszip';
import type { PlasticType, SpoolProfile } from '../types';
import { generateId } from './storage';

// Типы пластиков, которые мы умеем распознавать
const PLASTIC_MAP: [RegExp, PlasticType][] = [
  [/PETG/i, 'PETG'],
  [/PET\b/i, 'PETG'],
  [/TPU|FLEX|TPE/i, 'TPU'],
  [/ABS/i, 'ABS'],
  [/ASA/i, 'ABS'],
  [/NYLON|PA\b|PA12|PA6/i, 'Nylon'],
  [/PLA/i, 'PLA'],
];

function extractPlasticType(inherits: string, name: string): PlasticType {
  const text = inherits + ' ' + name;
  for (const [re, type] of PLASTIC_MAP) {
    if (re.test(text)) return type;
  }
  return 'Другой';
}

export interface FilamentPresetRecord {
  name: string;
  color: string;
  plasticType: PlasticType;
  /** Цена за кг (из filament_cost OrcaSlicer = ₽/кг) */
  pricePerKg: number;
}

/**
 * Читает ZIP-архив с пресетами OrcaSlicer (Filament presets.zip)
 * и возвращает список распознанных профилей.
 */
export async function parseFilamentPresetsZip(file: File): Promise<FilamentPresetRecord[]> {
  const zip = await JSZip.loadAsync(file);
  const results: FilamentPresetRecord[] = [];

  for (const [, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    const fn = entry.name.toLowerCase();
    if (!fn.endsWith('.json')) continue;

    let json: Record<string, unknown>;
    try {
      const text = await entry.async('text');
      json = JSON.parse(text);
    } catch {
      continue;
    }

    // Нужны хотя бы name и filament_cost
    const rawName = (json['name'] as string | undefined) ?? (json['filament_settings_id'] as string[] | undefined)?.[0];
    if (!rawName) continue;

    const costRaw = Array.isArray(json['filament_cost'])
      ? (json['filament_cost'] as string[])[0]
      : (json['filament_cost'] as string | undefined);
    const pricePerKg = parseFloat(String(costRaw ?? '0')) || 0;

    const colorRaw = Array.isArray(json['default_filament_colour'])
      ? (json['default_filament_colour'] as string[])[0]
      : (json['default_filament_colour'] as string | undefined);
    const color = colorRaw && /^#[0-9a-f]{6}$/i.test(colorRaw) ? colorRaw : '#888888';

    const inherits = String(json['inherits'] ?? '');
    const plasticType = extractPlasticType(inherits, rawName);

    results.push({ name: rawName, color, plasticType, pricePerKg });
  }

  // Сортируем по имени
  results.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  return results;
}

/**
 * Конвертирует FilamentPresetRecord → SpoolProfile.
 * Вес катушки по умолчанию 1000 г (стандартная катушка),
 * цена = pricePerKg (filament_cost в OrcaSlicer = ₽ за кг = ₽ за 1000 г).
 */
export function presetToSpool(preset: FilamentPresetRecord): SpoolProfile {
  return {
    id: generateId(),
    name: preset.name,
    plasticType: preset.plasticType,
    color: preset.color,
    price: preset.pricePerKg,   // filament_cost = ₽/кг ≈ цена 1000г катушки
    weight: 1000,
    note: `Импорт из OrcaSlicer`,
  };
}
