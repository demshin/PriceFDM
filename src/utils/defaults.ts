import type { AppSettings, ProcessingItem, PrintCalculationInput } from '../types';

export const COMPLEXITY_OPTIONS = [
  { value: 1.0,  label: 'Очень простая', description: 'коробки, корпуса, простые детали' },
  { value: 1.15, label: 'Обычная',        description: 'умеренные поддержки' },
  { value: 1.3,  label: 'Сложная',        description: 'много мелких элементов' },
  { value: 1.6,  label: 'Очень сложная',  description: 'миниатюры, высокий риск брака' },
] as const;

export const DEFAULT_SETTINGS: AppSettings = {
  defaultElectricityCost: 6,
  defaultPowerWatts: 220,
  defaultPrinterLifeHours: 3000,
  defaultProfitPercent: 30,
  colorMode: 'light',
};

export const DEFAULT_PROCESSING_ITEMS: ProcessingItem[] = [
  { id: 'supports',   name: 'Снятие поддержек', enabled: false, cost: 50,  costMode: 'fixed',    ratePerGram: undefined },
  { id: 'sanding',    name: 'Шлифовка',          enabled: false, cost: 0,   costMode: 'per_gram', ratePerGram: 1 },
  { id: 'painting',   name: 'Покраска',           enabled: false, cost: 0,   costMode: 'per_gram', ratePerGram: 2.7 },
  { id: 'gluing',     name: 'Склейка',            enabled: false, cost: 50,  costMode: 'fixed',    ratePerGram: undefined },
  { id: 'priming',    name: 'Грунтовка',          enabled: false, cost: 0,   costMode: 'per_gram', ratePerGram: 0.75 },
  { id: 'lacquering', name: 'Лакировка',          enabled: false, cost: 0,   costMode: 'per_gram', ratePerGram: 1 },
  { id: 'packaging',  name: 'Упаковка',           enabled: false, cost: 150, costMode: 'fixed',    ratePerGram: undefined },
  { id: 'custom',     name: 'Пользовательский этап', enabled: false, cost: 0, costMode: 'fixed', isCustom: true },
];

export const makeDefaultInput = (settings: AppSettings): PrintCalculationInput => ({
  partName: '',
  spoolProfileId: undefined,
  printerProfileId: undefined,
  spoolPrice: 0,
  spoolWeight: 1000,
  partWeight: 0,
  modelWeight: 0,
  printHours: 0,
  printMinutes: 0,
  powerWatts: settings.defaultPowerWatts,
  electricityCostPerKwh: settings.defaultElectricityCost,
  printerCost: 0,
  printerLifeHours: settings.defaultPrinterLifeHours,
  quantity: 1,
  extraCost: 0,
  processing: {
    enabled: false,
    items: DEFAULT_PROCESSING_ITEMS.map(i => ({ ...i })),
  },
  profitMode: 'percent',
  profitValue: settings.defaultProfitPercent,
  roundingEnabled: false,
  complexityCoefficient: 1.0,
  complexityLabel: 'Очень простая',
  wholesaleEnabled: false,
  wholesaleDiscount: 10,
});
