import type { PrintCalculationInput, PrintCalculationResult, ProcessingItem } from '../types';

export function roundPrice(price: number): number {
  if (price >= 1000) {
    return Math.round(price / 50) * 50;
  } else if (price >= 100) {
    return Math.round(price / 10) * 10;
  } else if (price >= 10) {
    return Math.round(price / 5) * 5;
  } else {
    return Math.round(price);
  }
}

export function calculate(input: PrintCalculationInput): PrintCalculationResult {
  const printTimeHours = Math.max(0, input.printHours) + Math.max(0, input.printMinutes) / 60;

  const spoolWeight = input.spoolWeight > 0 ? input.spoolWeight : 1000;
  const gramCost = input.spoolPrice > 0 && spoolWeight > 0 ? input.spoolPrice / spoolWeight : 0;
  const materialCost = gramCost * Math.max(0, input.partWeight);

  const powerKW = Math.max(0, input.powerWatts) / 1000;
  const electricityCost = powerKW * printTimeHours * Math.max(0, input.electricityCostPerKwh);

  const lifeHours = input.printerLifeHours > 0 ? input.printerLifeHours : 3000;
  const wearCostPerHour = input.printerCost > 0 ? input.printerCost / lifeHours : 0;
  const wearCostRaw = wearCostPerHour * printTimeHours;

  const activeProcessingItems: ProcessingItem[] = [];
  let processingCostRaw = 0;

  if (input.processing.enabled) {
    for (const item of input.processing.items) {
      if (item.enabled) {
        const itemCost = Math.max(0, item.cost);
        processingCostRaw += itemCost;
        activeProcessingItems.push({ ...item, cost: itemCost });
      }
    }
  }

  const complexity = Math.max(1, input.complexityCoefficient ?? 1);
  const complexityLabel = input.complexityLabel ?? 'Очень простая';
  const wearCost = wearCostRaw * complexity;
  const processingCost = processingCostRaw * complexity;

  const extraCost = Math.max(0, input.extraCost);
  const costPrice = materialCost + electricityCost + wearCost + processingCost + extraCost;

  let profit: number;
  if (input.profitMode === 'percent') {
    profit = costPrice * Math.max(0, input.profitValue) / 100;
  } else {
    profit = Math.max(0, input.profitValue);
  }

  const pricePerPieceBeforeDiscount = costPrice + profit;

  // Оптовая скидка (только если количество > 1 и скидка включена)
  const quantity = Math.max(1, Math.floor(input.quantity));
  const wholesaleActive = (input.wholesaleEnabled ?? false) && quantity > 1;
  const wholesaleDiscountApplied = wholesaleActive ? Math.max(0, Math.min(100, input.wholesaleDiscount ?? 10)) : 0;
  const discountFactor = 1 - wholesaleDiscountApplied / 100;
  const pricePerPiece = pricePerPieceBeforeDiscount * discountFactor;

  const pricePerPieceRounded = input.roundingEnabled ? roundPrice(pricePerPiece) : null;

  const totalCostPrice = costPrice * quantity;
  const totalProfit = profit * quantity;
  const totalPriceBeforeDiscount = pricePerPieceBeforeDiscount * quantity;
  const totalPrice = pricePerPiece * quantity;
  const totalPriceRounded = input.roundingEnabled ? roundPrice(totalPrice) : null;

  return {
    materialCost,
    electricityCost,
    wearCost,
    wearCostRaw,
    processingCost,
    processingCostRaw,
    extraCost,
    costPrice,
    complexityCoefficient: complexity,
    complexityLabel,
    profit,
    pricePerPiece,
    pricePerPieceBeforeDiscount,
    wholesaleDiscountApplied,
    pricePerPieceRounded,
    totalCostPrice,
    totalProfit,
    totalPrice,
    totalPriceBeforeDiscount,
    totalPriceRounded,
    printTimeHours,
    gramCost,
    processingItems: activeProcessingItems,
    profitMode: input.profitMode,
    profitValue: input.profitValue,
    roundingEnabled: input.roundingEnabled,
  };
}

export function formatMoney(value: number): string {
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
}

export function formatMoneyShort(value: number): string {
  if (value === 0) return '0 ₽';
  return value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
}

export function formatTime(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return '—';
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ч`);
  if (minutes > 0) parts.push(`${minutes} мин`);
  return parts.join(' ');
}
