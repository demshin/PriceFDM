import React from 'react';
import {
  Box,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import type { PrintCalculationResult, PrintCalculationInput } from '../../types';
import { formatMoney } from '../../utils/calculations';
import { useTranslation } from '../../i18n/useTranslation';

interface BreakdownRowProps {
  label: string;
  value: number;
  total: number;
  color?: string;
  indent?: boolean;
  bold?: boolean;
}

const BreakdownRow: React.FC<BreakdownRowProps> = ({ label, value, total, color = '#2563EB', indent, bold }) => {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <Box sx={{ pl: indent ? 3 : 0 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" fontWeight={bold ? 700 : 400} color={bold ? 'text.primary' : 'text.secondary'}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={bold ? 700 : 500}>
          {formatMoney(value)}
        </Typography>
      </Stack>
      {!bold && (
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            mt: 0.5,
            height: 4,
            borderRadius: 2,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 2 },
          }}
        />
      )}
    </Box>
  );
};

interface Props {
  result: PrintCalculationResult;
  input: PrintCalculationInput;
}

const BreakdownPanel: React.FC<Props> = ({ result, input }) => {
  const { t } = useTranslation();
  const timeStr = (() => {
    const h = Math.floor(result.printTimeHours);
    const m = Math.round((result.printTimeHours - h) * 60);
    const parts = [];
    if (h > 0) parts.push(`${h} ${t.common_hour_short}`);
    if (m > 0) parts.push(`${m} ${t.common_min_short}`);
    return parts.length > 0 ? parts.join(' ') : `< 1 ${t.common_min_short}`;
  })();

  const wearPerHour =
    input.printerLifeHours > 0 && input.printerCost > 0
      ? input.printerCost / input.printerLifeHours
      : 0;

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
        {t.brk_title}
      </Typography>

      {/* Сложность модели */}
      <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" fontWeight={600} color="primary.main">
            {t.calc_complexity}
          </Typography>
          <Typography variant="body2" fontWeight={700} color="primary.main">
            {result.complexityLabel}{'\u00A0'}<Typography component="span" variant="caption" color="primary">×{result.complexityCoefficient}</Typography>
          </Typography>
        </Stack>
        {result.complexityCoefficient > 1 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {t.calc_complexity_desc}
          </Typography>
        )}
      </Box>

      {/* Материал */}
      <Box>
        <BreakdownRow
          label={`${t.brk_material} (${input.partWeight} ${t.common_grams} × ${result.gramCost.toFixed(2)} ₽)`}
          value={result.materialCost}
          total={result.costPrice}
          color="#2563EB"
        />
        {result.gramCost > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ pl: 0 }}>
            {t.calc_spool_label}: {input.spoolPrice} ₽ / {input.spoolWeight} {t.common_grams} = {result.gramCost.toFixed(2)} ₽/{t.common_grams}
          </Typography>
        )}
      </Box>

      {/* Электроэнергия */}
      <Box>
        <BreakdownRow
          label={`${t.brk_electricity} (${input.powerWatts} ${t.common_watts} · ${timeStr})`}
          value={result.electricityCost}
          total={result.costPrice}
          color="#7C3AED"
        />
        <Typography variant="caption" color="text.secondary">
          {(input.powerWatts / 1000).toFixed(3)} кВт × {result.printTimeHours.toFixed(2)} ч × {input.electricityCostPerKwh} ₽
        </Typography>
      </Box>

      {/* Износ принтера */}
      <Box>
        <BreakdownRow
          label={result.complexityCoefficient > 1
            ? `${t.brk_printer_wear} (${wearPerHour.toFixed(2)} ₽/${t.common_hour_short} · ${timeStr}) ×${result.complexityCoefficient}`
            : `${t.brk_printer_wear} (${wearPerHour.toFixed(2)} ₽/${t.common_hour_short} · ${timeStr})`
          }
          value={result.wearCost}
          total={result.costPrice}
          color="#F59E0B"
        />
        {input.printerCost > 0 && (
          <Typography variant="caption" color="text.secondary">
            {input.printerCost.toLocaleString('ru-RU')} ₽ / {input.printerLifeHours} ч = {wearPerHour.toFixed(2)} ₽/ч
            {result.complexityCoefficient > 1 && (
              <> · <Typography component="span" variant="caption" color="warning.main" fontWeight={600}>
                {formatMoney(result.wearCostRaw)} → {formatMoney(result.wearCost)}
              </Typography></>
            )}
          </Typography>
        )}
      </Box>

      {/* Обработка */}
      {result.processingCost > 0 && (
        <Box>
          <BreakdownRow
            label={result.complexityCoefficient > 1
              ? `Обработка (${formatMoney(result.processingCostRaw)} ×${result.complexityCoefficient})`
              : 'Обработка (сумма)'
            }
            value={result.processingCost}
            total={result.costPrice}
            color="#10B981"
          />
          {result.complexityCoefficient > 1 && (
            <Typography variant="caption" color="success.main" fontWeight={600} sx={{ pl: 0 }}>
              {formatMoney(result.processingCostRaw)} → {formatMoney(result.processingCost)} (с учётом сложности)
            </Typography>
          )}
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {result.processingItems.map((item) => (
              <Stack key={item.id} direction="row" justifyContent="space-between" sx={{ pl: 2 }}>
                <Typography variant="caption" color="text.secondary">· {item.name}</Typography>
                <Typography variant="caption">{formatMoney(item.cost)}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      {/* Доп. расходы */}
      {result.extraCost > 0 && (
        <BreakdownRow
          label={t.brk_extra}
          value={result.extraCost}
          total={result.costPrice}
          color="#64748B"
        />
      )}

      <Divider />

      {/* Себестоимость */}
      <BreakdownRow
        label={t.calc_cost_price}
        value={result.costPrice}
        total={result.costPrice}
        bold
      />

      {/* Прибыль */}
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2" color="success.main" fontWeight={600}>
          {t.res_profit}{' '}
          {result.profitMode === 'percent'
            ? `(${result.profitValue}%)`
            : `(${t.res_fixed_profit.toLowerCase()})`}
        </Typography>
        <Typography variant="body2" color="success.main" fontWeight={600}>
          + {formatMoney(result.profit)}
        </Typography>
      </Stack>

      <Divider />

      {/* Итог */}
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body1" fontWeight={700}>{t.brk_total} ({t.res_piece_short})</Typography>
        <Typography variant="body1" fontWeight={700} color="primary">
          {formatMoney(result.pricePerPiece)}
        </Typography>
      </Stack>

      {/* Округление */}
      {result.roundingEnabled && result.pricePerPieceRounded !== null && (
        <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">{t.res_before_rounding}</Typography>
            <Typography variant="body2">{formatMoney(result.pricePerPiece)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" fontWeight={700}>{t.res_after}</Typography>
            <Typography variant="body2" fontWeight={700} color="primary">
              {formatMoney(result.pricePerPieceRounded)}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {t.res_batch_before_rounding}: {formatMoney(Math.abs(result.pricePerPieceRounded - result.pricePerPiece))}
          </Typography>
        </Box>
      )}

      {/* Партия */}
      {input.quantity > 1 && (
        <>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">{t.calc_quantity_parts}</Typography>
            <Typography variant="body2">{input.quantity} {t.res_pieces}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body1" fontWeight={700}>{t.brk_total} ({t.res_batch.toLowerCase()})</Typography>
            <Typography variant="body1" fontWeight={700} color="primary">
              {result.roundingEnabled && result.totalPriceRounded !== null
                ? formatMoney(result.totalPriceRounded)
                : formatMoney(result.totalPrice)}
            </Typography>
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default BreakdownPanel;
