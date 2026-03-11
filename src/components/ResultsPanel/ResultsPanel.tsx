import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import type { PrintCalculationResult, PrintCalculationInput, SpoolProfile, PrinterProfile } from '../../types';
import { formatMoney } from '../../utils/calculations';

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
    </Stack>
  );
};

export default ResultsPanel;
