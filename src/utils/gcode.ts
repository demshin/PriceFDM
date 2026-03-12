export interface GcodeParseResult {
  /** Общий расход филамента (включая поддержки, юбку и т.д.) */
  weightGrams?: number;
  /** Вес только модели без поддержек (если слайсер предоставляет эти данные) */
  modelWeightGrams?: number;
  printHours?: number;
  printMinutes?: number;
  slicerName?: string;
  /** Тип пластика, напр. "PLA", "PETG" */
  filamentType?: string;
  /** Название пресета катушки в слайсере, напр. "NIT PLA Mint" */
  filamentSettingsId?: string;
  /** Цвет филамента в HEX, напр. "#00EAEA" */
  filamentColor?: string;
  /** Производитель, напр. "NIT" */
  filamentVendor?: string;
}

/**
 * Парсит G-code файл PrusaSlicer, OrcaSlicer или Cura и извлекает
 * расход филамента (г), вес детали без поддержек (г) и время печати (ч + мин).
 */
export function parseGcode(content: string): GcodeParseResult {
  const result: GcodeParseResult = {};

  // ─── Вес филамента ────────────────────────────────────────────────────────

  // PrusaSlicer с несколькими экструдерами: ; filament used [g] = [15.32, 1.23]
  // Первый элемент — модель, второй — материал поддержек
  const prusaMulti = content.match(/;\s*filament\s+used\s*\[g\]\s*=\s*\[([\d.,\s]+)\]/i);
  if (prusaMulti) {
    const parts = prusaMulti[1].split(',').map((s) => parseFloat(s.trim())).filter((n) => !isNaN(n));
    if (parts.length >= 1) {
      result.modelWeightGrams = parts[0];
      result.weightGrams = parseFloat(parts.reduce((a, b) => a + b, 0).toFixed(2));
      result.slicerName = 'PrusaSlicer';
    }
  }

  // PrusaSlicer / OrcaSlicer одноэкструдерный: ; filament used [g] = 15.32
  // OrcaSlicer: ; total filament used [g] = 15.32
  if (!result.weightGrams) {
    const prusaWeight = content.match(/;\s*(?:total\s+)?filament\s+used\s*\[g\]\s*=\s*([\d.]+)/i);
    if (prusaWeight) {
      result.weightGrams = parseFloat(prusaWeight[1]);
      result.slicerName = 'PrusaSlicer / OrcaSlicer';
    }
  }

  // OrcaSlicer (некоторые версии) разбивает по типам слоёв:
  //   ; inner wall weight: X g
  //   ; outer wall weight: X g
  //   ; sparse infill weight: X g
  //   ; top surface weight: X g   (или solid infill)
  //   ; bottom surface weight: X g
  //   ; ironing weight: X g
  //   ; support weight: X g       ← поддержки (НЕ учитываем в весе модели)
  //   ; brim weight: X g          ← юбка
  //   ; model weight: X g         ← прямой вес модели (есть в некоторых версиях)
  if (!result.modelWeightGrams && result.weightGrams) {
    // Сначала пробуем прямую метку веса модели (есть в OrcaSlicer 2.2+)
    const directModel = parseLayerWeight(content, 'model');
    if (directModel !== undefined && directModel > 0) {
      result.modelWeightGrams = directModel;
    } else {
      // Иначе считаем как общий минус поддержки и юбка
      const supportWeight = parseLayerWeight(content, 'support(?:\s+interface)?');
      const brimWeight    = parseLayerWeight(content, 'brim|skirt');
      const deductible = (supportWeight ?? 0) + (brimWeight ?? 0);
      if (deductible > 0) {
        const candidate = parseFloat((result.weightGrams - deductible).toFixed(2));
        if (candidate > 0) result.modelWeightGrams = candidate;
      }
    }
  }

  // Cura: ;Filament used: 5.65g  or  ;Filament used: 2.34m
  if (!result.weightGrams) {
    const curaWeight = content.match(/^;Filament used:\s*([\d.]+)([gm])/im);
    if (curaWeight) {
      const val = parseFloat(curaWeight[1]);
      const unit = curaWeight[2].toLowerCase();
      // При метрах → граммы: ~2.4 г/м для PLA 1.75 мм (приближение)
      result.weightGrams = unit === 'm' ? parseFloat((val * 2.4).toFixed(1)) : val;
      result.slicerName = 'Cura';
    }
  }

  // ─── Время печати ─────────────────────────────────────────────────────────
  // PrusaSlicer: ; estimated printing time (normal mode) = 1h 23m 5s
  const prusaTime = content.match(
    /;\s*estimated printing time(?:\s*\([^)]*\))?\s*=\s*((?:\d+h\s*)?(?:\d+m\s*)?(?:\d+s)?)/i,
  );
  if (prusaTime) {
    const t = prusaTime[1];
    result.printHours   = parseInt(t.match(/(\d+)h/)?.[1] ?? '0');
    result.printMinutes = parseInt(t.match(/(\d+)m/)?.[1] ?? '0');
  }

  // OrcaSlicer: ; total estimated time: 01:23:15  or  01:23
  if (result.printHours === undefined) {
    const orcaTime = content.match(/;\s*total estimated time:\s*(\d{1,2}:\d{2}(?::\d{2})?)/i);
    if (orcaTime) {
      const parts = orcaTime[1].split(':');
      result.printHours   = parseInt(parts[0]);
      result.printMinutes = parseInt(parts[1]);
    }
  }

  // Cura: ;TIME:4995  (секунды)
  if (result.printHours === undefined) {
    const curaTime = content.match(/^;TIME:(\d+)/im);
    if (curaTime) {
      const secs = parseInt(curaTime[1]);
      result.printHours   = Math.floor(secs / 3600);
      result.printMinutes = Math.floor((secs % 3600) / 60);
    }
  }

  // ─── Информация о катушке ────────────────────────────────────────────────
  // OrcaSlicer / PrusaSlicer: ; filament_type = PLA
  const ftMatch = content.match(/;\s*filament_type\s*=\s*(\S+)/i);
  if (ftMatch) {
    result.filamentType = ftMatch[1].trim();
  }
  // Верх файла: ;initial_filament:PLA (BambuStudio / OrcaSlicer Start)
  if (!result.filamentType) {
    const initMatch = content.match(/^;initial_filament:(\S+)/im);
    if (initMatch) result.filamentType = initMatch[1].trim();
  }

  // ; filament_settings_id = "NIT PLA Mint"
  const fsIdMatch = content.match(/;\s*filament_settings_id\s*=\s*"?([^"\r\n]+)"?/i);
  if (fsIdMatch) result.filamentSettingsId = fsIdMatch[1].trim();

  // ; filament_colour = #00EAEA
  const colorMatch = content.match(/;\s*filament_colour\s*=\s*([#\w]+)/i);
  if (colorMatch) result.filamentColor = colorMatch[1].trim();

  // ; filament_vendor = NIT
  const vendorMatch = content.match(/;\s*filament_vendor\s*=\s*([^\r\n]+)/i);
  if (vendorMatch) result.filamentVendor = vendorMatch[1].trim();

  return result;
}

/**
 * Ищет вес слоя по ключевому слову — формат OrcaSlicer:
 *   ; support weight: 3.21 g
 */
function parseLayerWeight(content: string, keyword: string): number | undefined {
  const re = new RegExp(`;\\s*${keyword}\\s+weight:\\s*([\\d.]+)\\s*g`, 'i');
  const m = content.match(re);
  return m ? parseFloat(m[1]) : undefined;
}
