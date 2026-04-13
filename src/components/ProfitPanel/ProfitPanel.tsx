import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { ProfitEntry } from '../../types';
import { formatMoney } from '../../utils/calculations';
import { generateId } from '../../utils/storage';
import ConfirmDialog from '../common/ConfirmDialog';
import NumberField from '../common/NumberField';

type SortKey = 'label' | 'quantity' | 'baseCostPerPiece' | 'salePricePerPiece' | 'revenue' | 'profit';
type SortDir = 'asc' | 'desc';

interface Props {
  entries: ProfitEntry[];
  onUpdate: (entries: ProfitEntry[]) => void;
}

// ─── Диалог добавления/редактирования ────────────────────────────────────────

interface EntryDialogProps {
  open: boolean;
  initial?: Partial<ProfitEntry>;
  onSave: (entry: Omit<ProfitEntry, 'id' | 'createdAt'>) => void;
  onClose: () => void;
  title: string;
}

const EntryDialog: React.FC<EntryDialogProps> = ({ open, initial, onSave, onClose, title }) => {
  const [label, setLabel] = useState(initial?.label ?? '');
  const [quantity, setQuantity] = useState(initial?.quantity ?? 1);
  const [baseCost, setBaseCost] = useState(initial?.baseCostPerPiece ?? 0);
  const [salePrice, setSalePrice] = useState(initial?.salePricePerPiece ?? 0);

  React.useEffect(() => {
    if (open) {
      setLabel(initial?.label ?? '');
      setQuantity(initial?.quantity ?? 1);
      setBaseCost(initial?.baseCostPerPiece ?? 0);
      setSalePrice(initial?.salePricePerPiece ?? 0);
    }
  }, [open, initial]);

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({
      label: label.trim(),
      quantity: Math.max(1, Math.floor(quantity)),
      baseCostPerPiece: Math.max(0, baseCost),
      salePricePerPiece: Math.max(0, salePrice),
      isManual: true,
    });
  };

  const profit = (salePrice - baseCost) * quantity;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label="Название"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            size="small"
            autoFocus
            fullWidth
            placeholder="Название детали или заказа"
          />
          <NumberField
            label="Количество, шт."
            value={quantity}
            onChange={(v) => setQuantity(typeof v === 'number' ? v : 1)}
            min={1}
            step={1}
            size="small"
          />
          <NumberField
            label="Себестоимость за 1 шт., ₽"
            value={baseCost}
            onChange={(v) => setBaseCost(typeof v === 'number' ? v : 0)}
            min={0}
            size="small"
            helperText="Только материалы + электричество + износ принтера"
          />
          <NumberField
            label="Цена продажи за 1 шт., ₽"
            value={salePrice}
            onChange={(v) => setSalePrice(typeof v === 'number' ? v : 0)}
            min={0}
            size="small"
          />
          {label.trim() && (
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: profit >= 0 ? 'success.main' : 'error.main', opacity: 0.9 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'white' }}>Чистая прибыль ({quantity} шт.)</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>
                  {profit >= 0 ? '+' : ''}{formatMoney(profit)}
                </Typography>
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSave} disabled={!label.trim()}>Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── График ──────────────────────────────────────────────────────────────────

const ChartView: React.FC<{ entries: ProfitEntry[] }> = ({ entries }) => {
  const data = entries.map((e) => ({
    name: e.label.length > 14 ? e.label.slice(0, 13) + '…' : e.label,
    Выручка: +(e.salePricePerPiece * e.quantity).toFixed(2),
    Себестоимость: +(e.baseCostPerPiece * e.quantity).toFixed(2),
    Прибыль: +((e.salePricePerPiece - e.baseCostPerPiece) * e.quantity).toFixed(2),
  }));

  return (
    <Box sx={{ width: '100%', pt: 1 }}>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
          <YAxis tickFormatter={(v: number) => `${v.toLocaleString('ru-RU')} ₽`} tick={{ fontSize: 11 }} width={90} />
          <RTooltip
            formatter={(v: unknown) => [`${Number(v).toLocaleString('ru-RU')} ₽`] as [string]}
          />
          <Legend />
          <ReferenceLine y={0} stroke="#999" />
          <Bar dataKey="Выручка" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Себестоимость" fill="#f97316" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Прибыль" fill="#22c55e" radius={[4, 4, 0, 0]}
            label={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// ─── Основной компонент ───────────────────────────────────────────────────────

const ProfitPanel: React.FC<Props> = ({ entries, onUpdate }) => {
  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<ProfitEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<0 | 1>(0); // 0=таблица 1=график
  const [sortKey, setSortKey] = useState<SortKey>('label');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleAdd = (data: Omit<ProfitEntry, 'id' | 'createdAt'>) => {
    const entry: ProfitEntry = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    onUpdate([...entries, entry]);
    setAddOpen(false);
  };

  const handleEdit = (data: Omit<ProfitEntry, 'id' | 'createdAt'>) => {
    if (!editEntry) return;
    onUpdate(entries.map((e) => e.id === editEntry.id ? { ...e, ...data } : e));
    setEditEntry(null);
  };

  const handleDelete = (id: string) => {
    onUpdate(entries.filter((e) => e.id !== id));
    setDeleteId(null);
  };

  const handleQuantityChange = (id: string, qty: number) => {
    onUpdate(entries.map((e) => e.id === id ? { ...e, quantity: Math.max(1, Math.floor(qty)) } : e));
  };

  // ─── Поиск ──────────────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const filtered = useMemo(() =>
    q ? entries.filter((e) => e.label.toLowerCase().includes(q)) : entries,
    [entries, q]
  );

  // ─── Сортировка ─────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      switch (sortKey) {
        case 'label':      va = a.label; vb = b.label; break;
        case 'quantity':   va = a.quantity; vb = b.quantity; break;
        case 'baseCostPerPiece': va = a.baseCostPerPiece; vb = b.baseCostPerPiece; break;
        case 'salePricePerPiece': va = a.salePricePerPiece; vb = b.salePricePerPiece; break;
        case 'revenue':    va = a.salePricePerPiece * a.quantity; vb = b.salePricePerPiece * b.quantity; break;
        case 'profit':     va = (a.salePricePerPiece - a.baseCostPerPiece) * a.quantity; vb = (b.salePricePerPiece - b.baseCostPerPiece) * b.quantity; break;
      }
      if (typeof va === 'string') {
        return sortDir === 'asc' ? va.localeCompare(vb as string, 'ru') : (vb as string).localeCompare(va, 'ru');
      }
      return sortDir === 'asc' ? (va as number) - (vb as number) : (vb as number) - (va as number);
    });
  }, [filtered, sortKey, sortDir]);

  // ─── Агрегаты (по всем записям) ─────────────────────────────────────────────
  const totalRevenue = entries.reduce((acc, e) => acc + e.salePricePerPiece * e.quantity, 0);
  const totalBaseCost = entries.reduce((acc, e) => acc + e.baseCostPerPiece * e.quantity, 0);
  const totalProfit = totalRevenue - totalBaseCost;
  const totalItems = entries.reduce((acc, e) => acc + e.quantity, 0);

  return (
    <Box>
      {/* ─── Шапка ───────────────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h6">Таблица прибыли</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          onClick={() => setAddOpen(true)}
        >
          Добавить запись
        </Button>
      </Stack>

      {/* ─── Итоговые карточки ───────────────────────────────────────────── */}
      {entries.length > 0 && (
        <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
          <Card variant="outlined" sx={{ flex: 1, minWidth: 140 }}>
            <CardContent sx={{ py: '12px !important', px: 2 }}>
              <Typography variant="caption" color="text.secondary">Позиций / изделий</Typography>
              <Typography variant="h6" fontWeight={700}>{entries.length} / {totalItems} шт.</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, minWidth: 140 }}>
            <CardContent sx={{ py: '12px !important', px: 2 }}>
              <Typography variant="caption" color="text.secondary">Выручка</Typography>
              <Typography variant="h6" fontWeight={700}>{formatMoney(totalRevenue)}</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, minWidth: 140 }}>
            <CardContent sx={{ py: '12px !important', px: 2 }}>
              <Typography variant="caption" color="text.secondary">Себестоимость</Typography>
              <Typography variant="h6" fontWeight={700}>{formatMoney(totalBaseCost)}</Typography>
            </CardContent>
          </Card>
          <Card
            variant="outlined"
            sx={{
              flex: 1, minWidth: 140,
              bgcolor: totalProfit >= 0 ? 'success.main' : 'error.main',
              color: 'white',
            }}
          >
            <CardContent sx={{ py: '12px !important', px: 2 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Чистая прибыль</Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <TrendingUpIcon sx={{ fontSize: 18 }} />
                <Typography variant="h6" fontWeight={700}>
                  {totalProfit >= 0 ? '+' : ''}{formatMoney(totalProfit)}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* ─── Пустое состояние ────────────────────────────────────────────── */}
      {entries.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ py: 8, textAlign: 'center', borderStyle: 'dashed' }}
        >
          <TrendingUpIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" variant="h6">Записей пока нет</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5, mb: 2 }}>
            Добавьте расчёт из истории кнопкой «В прибыль» или создайте запись вручную
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAddOpen(true)}>
            Добавить вручную
          </Button>
        </Paper>
      ) : (
        <>
          {/* ─── Вкладки таблица / график ────────────────────────────────── */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5} flexWrap="wrap" gap={1}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}
            >
              <Tab icon={<TableChartIcon fontSize="small" />} iconPosition="start" label="Таблица" value={0} />
              <Tab icon={<BarChartIcon fontSize="small" />} iconPosition="start" label="График" value={1} />
            </Tabs>
            {activeTab === 0 && (
              <TextField
                size="small"
                placeholder="Поиск по названию..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 220 }}
              />
            )}
          </Stack>

          {activeTab === 1 ? (
            <ChartView entries={entries} />
          ) : (
            <>
              {sorted.length === 0 && q && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">Ничего не найдено по запросу «{search}»</Typography>
                </Box>
              )}
              {sorted.length > 0 && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sortDirection={sortKey === 'label' ? sortDir : false}>
                          <TableSortLabel
                            active={sortKey === 'label'}
                            direction={sortKey === 'label' ? sortDir : 'asc'}
                            onClick={() => handleSort('label')}
                          >
                            Название
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sortDirection={sortKey === 'quantity' ? sortDir : false}>
                          <TableSortLabel
                            active={sortKey === 'quantity'}
                            direction={sortKey === 'quantity' ? sortDir : 'asc'}
                            onClick={() => handleSort('quantity')}
                          >
                            Кол-во
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sortDirection={sortKey === 'baseCostPerPiece' ? sortDir : false}>
                          <TableSortLabel
                            active={sortKey === 'baseCostPerPiece'}
                            direction={sortKey === 'baseCostPerPiece' ? sortDir : 'asc'}
                            onClick={() => handleSort('baseCostPerPiece')}
                          >
                            Себест. / шт.
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sortDirection={sortKey === 'salePricePerPiece' ? sortDir : false}>
                          <TableSortLabel
                            active={sortKey === 'salePricePerPiece'}
                            direction={sortKey === 'salePricePerPiece' ? sortDir : 'asc'}
                            onClick={() => handleSort('salePricePerPiece')}
                          >
                            Цена / шт.
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sortDirection={sortKey === 'revenue' ? sortDir : false}>
                          <TableSortLabel
                            active={sortKey === 'revenue'}
                            direction={sortKey === 'revenue' ? sortDir : 'asc'}
                            onClick={() => handleSort('revenue')}
                          >
                            Выручка
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sortDirection={sortKey === 'profit' ? sortDir : false}>
                          <TableSortLabel
                            active={sortKey === 'profit'}
                            direction={sortKey === 'profit' ? sortDir : 'asc'}
                            onClick={() => handleSort('profit')}
                          >
                            Прибыль
                          </TableSortLabel>
                        </TableCell>
                        <TableCell align="right" sx={{ width: 80 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sorted.map((entry) => {
                        const entryProfit = (entry.salePricePerPiece - entry.baseCostPerPiece) * entry.quantity;
                        const entryRevenue = entry.salePricePerPiece * entry.quantity;
                        const isLoss = entryProfit < 0;
                        return (
                          <TableRow key={entry.id} hover>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="body2" fontWeight={500}>{entry.label}</Typography>
                                {entry.isManual && (
                                  <Chip label="ручная" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                                )}
                                {!entry.isManual && (
                                  <Chip label="из истории" size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuantityChange(entry.id, entry.quantity - 1)}
                                  disabled={entry.quantity <= 1}
                                  sx={{ p: 0.25 }}
                                >
                                  <Typography variant="caption" lineHeight={1}>−</Typography>
                                </IconButton>
                                <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>{entry.quantity}</Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => handleQuantityChange(entry.id, entry.quantity + 1)}
                                  sx={{ p: 0.25 }}
                                >
                                  <Typography variant="caption" lineHeight={1}>+</Typography>
                                </IconButton>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{formatMoney(entry.baseCostPerPiece)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{formatMoney(entry.salePricePerPiece)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{formatMoney(entryRevenue)}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={isLoss ? 'error.main' : 'success.main'}
                              >
                                {entryProfit >= 0 ? '+' : ''}{formatMoney(entryProfit)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" justifyContent="flex-end">
                                <Tooltip title="Редактировать">
                                  <IconButton size="small" onClick={() => setEditEntry(entry)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Удалить">
                                  <IconButton size="small" color="error" onClick={() => setDeleteId(entry.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Итоговая строка */}
                  <Divider />
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Stack direction="row" justifyContent="flex-end" spacing={4} flexWrap="wrap" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Итого выручка: <b>{formatMoney(totalRevenue)}</b>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Себестоимость: <b>{formatMoney(totalBaseCost)}</b>
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={totalProfit >= 0 ? 'success.main' : 'error.main'}
                      >
                        Чистая прибыль: {totalProfit >= 0 ? '+' : ''}{formatMoney(totalProfit)}
                      </Typography>
                    </Stack>
                  </Box>
                </TableContainer>
              )}
            </>
          )}
        </>
      )}

      {/* ─── Диалоги ─────────────────────────────────────────────────────── */}
      <EntryDialog
        open={addOpen}
        onSave={handleAdd}
        onClose={() => setAddOpen(false)}
        title="Добавить запись"
      />
      <EntryDialog
        open={!!editEntry}
        initial={editEntry ?? undefined}
        onSave={handleEdit}
        onClose={() => setEditEntry(null)}
        title="Редактировать запись"
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Удалить запись?"
        message="Запись будет удалена из таблицы прибыли."
        confirmLabel="Удалить"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        danger
      />
    </Box>
  );
};

export default ProfitPanel;
