import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import TuneIcon from '@mui/icons-material/Tune';
import type { PrintCalculationResult, PrintCalculationInput, SpoolProfile, PrinterProfile } from '../../types';
import { formatMoney, roundPrice } from '../../utils/calculations';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'default';
  large?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, color = 'default', large }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      bgcolor: color === 'default' ? 'background.default' : `${color}.main`,
      color: color === 'default' ? 'text.primary' : `${color}.contrastText`,
      border: '1px solid',
      borderColor: color === 'default' ? 'divider' : `${color}.main`,
      height: '100%',
    }}
  >
    <Typography
      variant={large ? 'h5' : 'h6'}
      fontWeight={700}
      sx={{ color: color === 'default' ? 'primary.main' : 'inherit' }}
    >
      {value}
    </Typography>
    <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.25 }}>
      {label}
    </Typography>
    {sub && (
      <Typography variant="caption" sx={{ opacity: 0.7 }}>
        {sub}
      </Typography>
    )}
  </Box>
);

interface Props {
  result: PrintCalculationResult;
  input: PrintCalculationInput;
  spools: SpoolProfile[];
  printers: PrinterProfile[];
}

const ResultsPanel: React.FC<Props> = ({ result, input, spools, printers }) => {
  const selectedSpool = spools.find((s) => s.id === input.spoolProfileId);
  const selectedPrinter = printers.find((p) => p.id === input.printerProfileId);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [previewPct, setPreviewPct] = useState<number | null>(null);

  // Предпросмотровая цена с другим % прибыли (только визуально, не меняет input)
  const previewPrice = previewPct !== null
    ? (input.profitMode === 'percent'
        ? result.costPrice + result.costPrice * previewPct / 100
        : result.costPrice + previewPct)
    : null;
  const previewPriceRounded = previewPrice !== null && result.roundingEnabled
    ? roundPrice(previewPrice)
    : previewPrice;
  const previewTotal = previewPriceRounded !== null ? previewPriceRounded * Math.max(1, input.quantity) : null;

  const priceDisplay = result.roundingEnabled && result.pricePerPieceRounded !== null
    ? result.pricePerPieceRounded
    : result.pricePerPiece;

  const totalPriceDisplay = result.roundingEnabled && result.totalPriceRounded !== null
    ? result.totalPriceRounded
    : result.totalPrice;

  const printHours = Math.floor(result.printTimeHours);
  const printMins = Math.round((result.printTimeHours - printHours) * 60);

  return (
    <Stack spacing={2}>
      {/* Заголовок */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography variant="h6" fontWeight={700}>
          {input.partName || 'Результаты расчёта'}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {selectedSpool && (
            <Chip
              size="small"
              label={`${selectedSpool.plasticType} · ${selectedSpool.name}`}
              sx={{
                bgcolor: selectedSpool.color + '33',
                borderColor: selectedSpool.color,
                border: '1px solid',
              }}
            />
          )}
          {selectedPrinter && (
            <Chip size="small" label={selectedPrinter.name} variant="outlined" />
          )}
          {(input.printHours > 0 || input.printMinutes > 0) && (
            <Chip
              size="small"
              variant="outlined"
              label={`⏱ ${printHours > 0 ? `${printHours} ч ` : ''}${printMins > 0 ? `${printMins} мин` : ''}`}
            />
          )}
          {input.partWeight > 0 && (
            <Chip size="small" variant="outlined" label={`⚖ ${input.partWeight} г`} />
          )}
        </Stack>
      </Stack>

      {/* Цена за 1 деталь */}
      <Card variant="outlined" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocalOfferIcon />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Цена за 1 деталь
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                {formatMoney(priceDisplay)}
              </Typography>
              {result.roundingEnabled && result.pricePerPieceRounded !== null && (
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  До округления: {formatMoney(result.pricePerPiece)}
                </Typography>
              )}
            </Box>
            <Box sx={{ textAlign: { sm: 'right' } }}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Себестоимость</Typography>
              <Typography variant="h6" fontWeight={600}>
                {formatMoney(result.costPrice)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Прибыль</Typography>
              <Typography variant="h6" fontWeight={600}>
                + {formatMoney(result.profit)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Сетка статистики — 1 деталь */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Себестоимость" value={formatMoney(result.costPrice)} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Прибыль" value={formatMoney(result.profit)} color="success" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Цена (за 1)" value={formatMoney(priceDisplay)} color="primary" />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label="Цена/грамм" value={result.gramCost > 0 ? formatMoney(result.gramCost) : '—'} />
        </Grid>
      </Grid>

      {/* Партия */}
      {input.quantity > 1 && (
        <>
          <Divider>
            <Chip
              label={`Партия · ${input.quantity} шт.`}
              icon={<Inventory2OutlinedIcon />}
              size="small"
            />
          </Divider>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard
                label="Общая себестоимость"
                value={formatMoney(result.totalCostPrice)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard
                label="Общая прибыль"
                value={formatMoney(result.totalProfit)}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard
                label={`Итого за ${input.quantity} шт.`}
                value={formatMoney(totalPriceDisplay)}
                color="primary"
                large
              />
            </Grid>
          </Grid>

          {result.roundingEnabled && result.totalPriceRounded !== null && (
            <Box sx={{ px: 1 }}>
              <Typography variant="caption" color="text.secondary">
                До округления партии: {formatMoney(result.totalPrice)} → После: {formatMoney(result.totalPriceRounded)}
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* Прибыль */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          bgcolor: 'success.main',
          color: 'success.contrastText',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <TrendingUpIcon fontSize="small" />
        <Typography variant="body2">
          {result.profitMode === 'percent'
            ? `Прибыль: ${result.profitValue}% от себестоимости = ${formatMoney(result.profit)}`
            : `Фиксированная прибыль: ${formatMoney(result.profit)}`}
        </Typography>
      </Box>

      {/* Ползунок «А что если» */}
      {result.profitMode === 'percent' && (
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title={sliderOpen ? 'Скрыть симулятор цены' : 'Симулятор цены — что будет при другом % прибыли'}>
              <IconButton size="small" color={sliderOpen ? 'primary' : 'default'} onClick={() => { setSliderOpen((v) => !v); setPreviewPct(result.profitValue); }}>
                <TuneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" color="text.secondary">
              Симулятор % прибыли
            </Typography>
          </Stack>
          <Collapse in={sliderOpen}>
            <Box sx={{ px: 1.5, pt: 1, pb: 0.5, border: '1px dashed', borderColor: 'divider', borderRadius: 2, mt: 0.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Текущая: <b>{result.profitValue}%</b> → {formatMoney(priceDisplay)}/шт.
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">Предпросмотр:</Typography>
                  <Typography variant="body2" fontWeight={700} color="primary">
                    {previewPriceRounded !== null ? formatMoney(previewPriceRounded) : '—'}/шт.
                  </Typography>
                  {input.quantity > 1 && previewTotal !== null && (
                    <Typography variant="caption" color="success.main">
                      ({formatMoney(previewTotal)} всего)
                    </Typography>
                  )}
                </Stack>
              </Stack>
              <Slider
                value={previewPct ?? result.profitValue}
                min={0}
                max={Math.max(200, result.profitValue * 2)}
                step={1}
                onChange={(_, v) => setPreviewPct(v as number)}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}%`}
                sx={{ color: 'primary.main' }}
                marks={[
                  { value: result.profitValue, label: `${result.profitValue}%` },
                ]}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Маржа при {previewPct ?? result.profitValue}%: {previewPriceRounded !== null
                  ? formatMoney(previewPriceRounded - result.costPrice)
                  : '—'}
                {previewPriceRounded !== null && result.costPrice > 0
                  ? ` (${((previewPriceRounded - result.costPrice) / previewPriceRounded * 100).toFixed(1)}% от цены)`
                  : ''}
              </Typography>
            </Box>
          </Collapse>
        </Box>
      )}
    </Stack>
  );
};

export default ResultsPanel;
