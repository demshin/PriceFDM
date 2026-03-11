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
  pricePerPieceRounded: number | null;
  totalCostPrice: number;
  totalProfit: number;
  totalPrice: number;
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
  input: PrintCalculationInput;
  result: PrintCalculationResult;
  spoolName?: string;
  printerName?: string;
}

export interface AppSettings {
  defaultElectricityCost: number;
  defaultPowerWatts: number;
  defaultPrinterLifeHours: number;
  defaultProfitPercent: number;
  colorMode: 'light' | 'dark';
}
