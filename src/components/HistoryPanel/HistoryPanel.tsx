import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import type { SavedCalculation } from '../../types';
import { formatMoney } from '../../utils/calculations';
import ConfirmDialog from '../common/ConfirmDialog';

interface HistoryItemProps {
  item: SavedCalculation;
  onLoad: (item: SavedCalculation) => void;
  onDelete: (id: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onLoad, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const date = new Date(item.savedAt);
  const dateStr = date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const input = item.input;
  const result = item.result;

  const pricePerPiece =
    result.roundingEnabled && result.pricePerPieceRounded !== null
      ? result.pricePerPieceRounded
      : result.pricePerPiece;

  const totalPrice =
    result.roundingEnabled && result.totalPriceRounded !== null
      ? result.totalPriceRounded
      : result.totalPrice;

  const h = Math.floor(result.printTimeHours);
  const m = Math.round((result.printTimeHours - h) * 60);
  const timeLabel = [h > 0 ? `${h} ч` : '', m > 0 ? `${m} мин` : ''].filter(Boolean).join(' ') || '—';

  return (
    <Card variant="outlined">
      <CardContent sx={{ pb: '12px !important' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              <Typography fontWeight={600} noWrap>
                {input.partName || 'Без названия'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dateStr} {timeStr}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
              {item.spoolName && <Chip size="small" label={item.spoolName} variant="outlined" />}
              {item.printerName && <Chip size="small" label={item.printerName} variant="outlined" />}
              <Chip size="small" label={`${input.quantity} шт.`} />
              <Chip size="small" label={`${input.partWeight} г`} variant="outlined" />
              {input.complexityCoefficient && input.complexityCoefficient > 1 && (
                <Chip
                  size="small"
                  label={`${input.complexityLabel ?? 'Сложность'} ×${input.complexityCoefficient}`}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
          <Stack alignItems="flex-end" spacing={0.5} flexShrink={0}>
            <Typography fontWeight={700} color="primary">
              {formatMoney(pricePerPiece)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              за 1 шт.
            </Typography>
            {input.quantity > 1 && (
              <Typography variant="body2" fontWeight={600} color="success.main">
                {formatMoney(totalPrice)} всего
              </Typography>
            )}
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1}>
          <Button
            size="small"
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Скрыть детали' : 'Показать детали'}
          </Button>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Загрузить в форму">
              <IconButton size="small" color="primary" onClick={() => onLoad(item)}>
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Удалить">
              <IconButton size="small" color="error" onClick={() => setConfirmDelete(true)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>

        <Collapse in={expanded}>
          <Divider sx={{ my: 1.5 }} />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Материал</Typography>
                  <Typography variant="caption">{formatMoney(result.materialCost)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Электроэнергия</Typography>
                  <Typography variant="caption">{formatMoney(result.electricityCost)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Износ принтера</Typography>
                  <Typography variant="caption">{formatMoney(result.wearCost)}</Typography>
                </Stack>
                {result.processingCost > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Обработка</Typography>
                    <Typography variant="caption">{formatMoney(result.processingCost)}</Typography>
                  </Stack>
                )}
                {result.extraCost > 0 && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Доп. расходы</Typography>
                    <Typography variant="caption">{formatMoney(result.extraCost)}</Typography>
                  </Stack>
                )}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack spacing={0.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Себестоимость</Typography>
                  <Typography variant="caption" fontWeight={600}>{formatMoney(result.costPrice)}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Прибыль {result.profitMode === 'percent' ? `(${result.profitValue}%)` : '(фикс.)'}
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    +{formatMoney(result.profit)}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Время печати</Typography>
                  <Typography variant="caption">{timeLabel}</Typography>
                </Stack>
                {result.processingItems.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Этапы обработки:</Typography>
                    {result.processingItems.map((pi) => (
                      <Typography key={pi.id} variant="caption" color="text.secondary" sx={{ display: 'block', pl: 1 }}>
                        · {pi.name}: {formatMoney(pi.cost)}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Collapse>
      </CardContent>

      <ConfirmDialog
        open={confirmDelete}
        title="Удалить расчёт?"
        message={`Расчёт «${input.partName || 'Без названия'}» от ${dateStr} будет удалён.`}
        confirmLabel="Удалить"
        onConfirm={() => { onDelete(item.id); setConfirmDelete(false); }}
        onCancel={() => setConfirmDelete(false)}
        danger
      />
    </Card>
  );
};

interface Props {
  history: SavedCalculation[];
  onLoad: (item: SavedCalculation) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

const HistoryPanel: React.FC<Props> = ({ history, onLoad, onDelete, onClearAll }) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [detailItem, setDetailItem] = useState<SavedCalculation | null>(null);

  const sorted = [...history].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">
          История расчётов
          {history.length > 0 && (
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({history.length} шт.)
            </Typography>
          )}
        </Typography>
        {history.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteSweepIcon />}
            onClick={() => setConfirmClear(true)}
          >
            Очистить всё
          </Button>
        )}
      </Stack>

      {history.length === 0 ? (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">
            История пуста. Сохраните расчёт из вкладки «Расчёт».
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {sorted.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              onLoad={(i) => { onLoad(i); }}
              onDelete={onDelete}
            />
          ))}
        </Stack>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Очистить историю?"
        message="Все сохранённые расчёты будут удалены без возможности восстановления."
        confirmLabel="Очистить"
        onConfirm={() => { onClearAll(); setConfirmClear(false); }}
        onCancel={() => setConfirmClear(false)}
        danger
      />

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onClose={() => setDetailItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Детали расчёта</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Детали загружены</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailItem(null)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryPanel;
