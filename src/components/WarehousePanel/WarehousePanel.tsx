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
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import type { WarehouseItem } from '../../types';
import { formatMoney } from '../../utils/calculations';
import { generateId } from '../../utils/storage';
import ConfirmDialog from '../common/ConfirmDialog';
import NumberField from '../common/NumberField';
import { useTranslation } from '../../i18n/useTranslation';

// ─── Категории ──────────────────────────────────────────────────────────────
const CATEGORIES_RU = [
  'Филамент',
  'Комплектующие',
  'Крепеж',
  'Электроника',
  'Краска/Лак',
  'Упаковка',
  'Инструмент',
  'Другое',
];
const CATEGORIES_EN = [
  'Filament',
  'Components',
  'Fasteners',
  'Electronics',
  'Paint/Lacquer',
  'Packaging',
  'Tools',
  'Other',
];

// ─── Диалог добавления/редактирования ────────────────────────────────────────

interface ItemDialogProps {
  open: boolean;
  initial?: WarehouseItem | null;
  onSave: (item: Omit<WarehouseItem, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const ItemDialog: React.FC<ItemDialogProps> = ({ open, initial, onSave, onClose }) => {
  const { t, lang } = useTranslation();
  const CATEGORIES = lang === 'en' ? CATEGORIES_EN : CATEGORIES_RU;
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'Другое');
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [quantity, setQuantity] = useState(initial?.quantity ?? 0);
  const [unit, setUnit] = useState(initial?.unit ?? 'шт');
  const [note, setNote] = useState(initial?.note ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setCategory(initial?.category ?? 'Другое');
      setPrice(initial?.price ?? 0);
      setQuantity(initial?.quantity ?? 0);
      setUnit(initial?.unit ?? 'шт');
      setNote(initial?.note ?? '');
      setErrors({});
    }
  }, [open, initial]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = t.common_name;
    if (price < 0) errs.price = t.common_price;
    if (quantity < 0) errs.quantity = t.wh_quantity;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      name: name.trim(),
      category,
      price: Math.max(0, price),
      quantity: Math.max(0, quantity),
      unit: unit.trim() || 'шт',
      note: note.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? t.wh_edit_item : t.wh_new_item}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t.wh_name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
            fullWidth
            size="small"
          />
          <TextField
            select
            label={t.wh_category}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
            size="small"
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <NumberField
            label={t.wh_price_per_unit}
            value={price}
            onChange={(v) => setPrice(typeof v === 'number' ? v : 0)}
            error={!!errors.price}
            helperText={errors.price}
            min={0}
            size="small"
          />
          <Stack direction="row" spacing={1}>
            <NumberField
              label={t.wh_quantity}
              value={quantity}
              onChange={(v) => setQuantity(typeof v === 'number' ? v : 0)}
              error={!!errors.quantity}
              helperText={errors.quantity}
              min={0}
              size="small"
            />
            <TextField
              label={t.wh_unit}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              size="small"
              sx={{ width: 100 }}
            />
          </Stack>
          <TextField
            label={t.wh_optional_note}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
            rows={2}
            fullWidth
            size="small"
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">{t.common_cancel}</Button>
        <Button onClick={handleSave} variant="contained">{t.common_save}</Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Сортировка ─────────────────────────────────────────────────────────────

type SortKey = 'name' | 'category' | 'price' | 'quantity' | 'total';
type SortDir = 'asc' | 'desc';

// ─── Основной компонент ─────────────────────────────────────────────────────

interface Props {
  items: WarehouseItem[];
  onUpdate: (items: WarehouseItem[]) => void;
}

const WarehousePanel: React.FC<Props> = ({ items, onUpdate }) => {
  const { t, lang } = useTranslation();
  const CATEGORIES = lang === 'en' ? CATEGORIES_EN : CATEGORIES_RU;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<WarehouseItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WarehouseItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleSave = (data: Omit<WarehouseItem, 'id' | 'createdAt'>) => {
    if (editTarget) {
      onUpdate(items.map((i) => i.id === editTarget.id ? { ...i, ...data } : i));
    } else {
      onUpdate([...items, { ...data, id: generateId(), createdAt: new Date().toISOString() }]);
    }
    setDialogOpen(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    onUpdate(items.filter((i) => i.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const filtered = useMemo(() => {
    let list = items;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.note ?? '').toLowerCase().includes(q)
      );
    }

    if (filterCategory !== 'all') {
      list = list.filter((i) => i.category === filterCategory);
    }

    const sorted = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name, 'ru'); break;
        case 'category': cmp = a.category.localeCompare(b.category, 'ru'); break;
        case 'price': cmp = a.price - b.price; break;
        case 'quantity': cmp = a.quantity - b.quantity; break;
        case 'total': cmp = (a.price * a.quantity) - (b.price * b.quantity); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [items, search, filterCategory, sortKey, sortDir]);

  const totalValue = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const openNew = () => { setEditTarget(null); setDialogOpen(true); };
  const openEdit = (item: WarehouseItem) => { setEditTarget(item); setDialogOpen(true); };

  return (
    <Box>
      {/* Заголовок */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <WarehouseIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>{t.wh_title}</Typography>
          <Chip label={`${items.length} ${t.wh_positions}`} size="small" variant="outlined" />
        </Stack>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          {t.wh_add}
        </Button>
      </Stack>

      {/* Статистика */}
      {items.length > 0 && (
        <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap">
          <Chip label={`${t.wh_total_stat}: ${formatMoney(totalValue)}`} color="primary" variant="outlined" />
          <Chip label={`${t.wh_units_stat}: ${totalItems}`} variant="outlined" />
          <Chip label={`${t.wh_cat_stat}: ${new Set(items.map(i => i.category)).size}`} variant="outlined" />
        </Stack>
      )}

      {/* Поиск и фильтр */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} mb={2}>
        <TextField
          size="small"
          placeholder={t.wh_search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            },
          }}
          sx={{ flex: 1 }}
        />
        <TextField
          select
          size="small"
          label={t.wh_category}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">{t.wh_all}</MenuItem>
          {CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* Таблица */}
      {filtered.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <WarehouseIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography color="text.secondary">
              {items.length === 0 ? t.wh_empty : t.common_no_results}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortKey === 'name' ? sortDir : false}>
                  <TableSortLabel active={sortKey === 'name'} direction={sortKey === 'name' ? sortDir : 'asc'} onClick={() => handleSort('name')}>
                    {t.wh_name}
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={sortKey === 'category' ? sortDir : false}>
                  <TableSortLabel active={sortKey === 'category'} direction={sortKey === 'category' ? sortDir : 'asc'} onClick={() => handleSort('category')}>
                    {t.wh_category}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sortDirection={sortKey === 'price' ? sortDir : false}>
                  <TableSortLabel active={sortKey === 'price'} direction={sortKey === 'price' ? sortDir : 'asc'} onClick={() => handleSort('price')}>
                    {t.wh_price}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sortDirection={sortKey === 'quantity' ? sortDir : false}>
                  <TableSortLabel active={sortKey === 'quantity'} direction={sortKey === 'quantity' ? sortDir : 'asc'} onClick={() => handleSort('quantity')}>
                    {t.wh_quantity}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sortDirection={sortKey === 'total' ? sortDir : false}>
                  <TableSortLabel active={sortKey === 'total'} direction={sortKey === 'total' ? sortDir : 'asc'} onClick={() => handleSort('total')}>
                    {t.wh_sum}
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right" sx={{ width: 80 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
                    {item.note && <Typography variant="caption" color="text.secondary">{item.note}</Typography>}
                  </TableCell>
                  <TableCell><Chip label={item.category} size="small" variant="outlined" /></TableCell>
                  <TableCell align="right">{formatMoney(item.price)}</TableCell>
                  <TableCell align="right">{item.quantity} {item.unit}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatMoney(item.price * item.quantity)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={t.common_edit}><IconButton size="small" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title={t.common_delete}><IconButton size="small" color="error" onClick={() => setDeleteTarget(item)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалоги */}
      <ItemDialog
        open={dialogOpen}
        initial={editTarget}
        onSave={handleSave}
        onClose={() => { setDialogOpen(false); setEditTarget(null); }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t.wh_delete_title}
        message={`«${deleteTarget?.name}» ${t.wh_delete_msg}`}
        confirmLabel={t.common_delete}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default WarehousePanel;
