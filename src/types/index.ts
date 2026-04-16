export type PlasticType = 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'Nylon' | 'Другой';

export interface SpoolProfile {
  id: string;
  name: string;
  plasticType: PlasticType;
  color: string;
  price: number;
  weight: number;
  note?: string;
}

export interface PrinterProfile {
  id: string;
  name: string;
  powerWatts: number;
  printerCost: number;
  lifeHours: number;
  note?: string;
}

export type ProcessingCostMode = 'fixed' | 'per_gram';

export interface ProcessingItem {
  id: string;
  name: string;
  enabled: boolean;
  cost: number;
  costMode: ProcessingCostMode;
  ratePerGram?: number;
  isCustom?: boolean;
}

export interface ProcessingOptions {
  enabled: boolean;
  items: ProcessingItem[];
}

export type ProfitMode = 'percent' | 'fixed';

export interface PrintCalculationInput {
  partName: string;
  spoolProfileId?: string;
  printerProfileId?: string;
  spoolPrice: number;
  spoolWeight: number;
  partWeight: number;
  modelWeight: number;
  printHours: number;
  printMinutes: number;
  powerWatts: number;
  electricityCostPerKwh: number;
  printerCost: number;
  printerLifeHours: number;
  quantity: number;
  extraCost: number;
  processing: ProcessingOptions;
  profitMode: ProfitMode;
  profitValue: number;
  roundingEnabled: boolean;
  complexityCoefficient: number;
  complexityLabel: string;
  wholesaleEnabled?: boolean;
  wholesaleDiscount?: number;
}

export interface PrintCalculationResult {
  materialCost: number;
  electricityCost: number;
  wearCost: number;
  wearCostRaw: number;
  processingCost: number;
  processingCostRaw: number;
  extraCost: number;
  costPrice: number;
  complexityCoefficient: number;
  complexityLabel: string;
  profit: number;
  pricePerPiece: number;
  pricePerPieceBeforeDiscount: number;
  wholesaleDiscountApplied: number;
  pricePerPieceRounded: number | null;
  totalCostPrice: number;
  totalProfit: number;
  totalPrice: number;
  totalPriceBeforeDiscount: number;
  totalPriceRounded: number | null;
  printTimeHours: number;
  gramCost: number;
  processingItems: ProcessingItem[];
  profitMode: ProfitMode;
  profitValue: number;
  roundingEnabled: boolean;
}

export interface SavedCalculation {
  id: string;
  savedAt: string;
  projectIds?: string[];
  input: PrintCalculationInput;
  result: PrintCalculationResult;
  spoolName?: string;
  printerName?: string;
  note?: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  color?: string;
  defectRate?: number;
}

export interface AppSettings {
  defaultElectricityCost: number;
  defaultPowerWatts: number;
  defaultPrinterLifeHours: number;
  defaultProfitPercent: number;
  colorMode: 'light' | 'dark';
}

/**
 * Запись в таблице прибыли.
 * Может быть создана автоматически из расчёта/проекта или добавлена вручную.
 */
export interface ProfitEntry {
  id: string;
  createdAt: string;
  /** Отображаемое название (название детали, проекта или ручная запись) */
  label: string;
  /** Количество штук/повторений */
  quantity: number;
  /**
   * Базовая себестоимость за 1 шт. (только материал + электричество + износ, без обработки и наценки).
   * Для ручных записей — вводится пользователем.
   */
  baseCostPerPiece: number;
  /** Цена продажи за 1 шт. */
  salePricePerPiece: number;
  /** ID расчёта из истории (если создан автоматически) */
  calculationId?: string;
  /** ID проекта (если создан из проекта) */
  projectId?: string;
  /** Ручная запись (не привязана к расчёту) */
  isManual?: boolean;
}
