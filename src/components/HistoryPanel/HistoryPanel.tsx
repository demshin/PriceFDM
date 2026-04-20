import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Popover,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import EditIcon from '@mui/icons-material/Edit';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SortIcon from '@mui/icons-material/Sort';
import ArticleIcon from '@mui/icons-material/Article';
import CommentIcon from '@mui/icons-material/Comment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';
import type { Project, SavedCalculation } from '../../types';

const COLOR_PALETTE = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#6b7280'];
import { formatMoney } from '../../utils/calculations';
import ConfirmDialog from '../common/ConfirmDialog';

// ─── Кошт-лист: вспомогательные функции ─────────────────────────────────────

const fmtCost = (v: number) =>
  v.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';

const generateCostSheetText = (item: SavedCalculation): string => {
  const pricePerPiece =
    item.result.roundingEnabled && item.result.pricePerPieceRounded !== null
      ? item.result.pricePerPieceRounded : item.result.pricePerPiece;
  const totalPrice =
    item.result.roundingEnabled && item.result.totalPriceRounded !== null
      ? item.result.totalPriceRounded : item.result.totalPrice;
  const h = Math.floor(item.result.printTimeHours);
  const m = Math.round((item.result.printTimeHours - h) * 60);
  const timeLabel = [h > 0 ? `${h} ч` : '', m > 0 ? `${m} мин` : ''].filter(Boolean).join(' ') || '—';
  let text = `=== ${item.input.partName || 'Изделие'} ===\n`;
  text += `Дата: ${new Date(item.savedAt).toLocaleDateString('ru-RU')}\n`;
  if (item.spoolName) text += `Материал: ${item.spoolName}\n`;
  if (item.printerName) text += `Принтер: ${item.printerName}\n`;
  text += `Вес изделия: ${item.input.partWeight} г\n`;
  text += `Время печати: ${timeLabel}\n`;
  text += `Количество: ${item.input.quantity} шт.\n`;
  text += `Цена за 1 шт.: ${fmtCost(pricePerPiece)}\n`;
  if (item.input.quantity > 1) text += `Итого: ${fmtCost(totalPrice)}\n`;
  if (item.note) text += `\nПримечание: ${item.note}\n`;
  return text;
};

const generateCostSheetHtml = (item: SavedCalculation): string => {
  const pricePerPiece =
    item.result.roundingEnabled && item.result.pricePerPieceRounded !== null
      ? item.result.pricePerPieceRounded : item.result.pricePerPiece;
  const totalPrice =
    item.result.roundingEnabled && item.result.totalPriceRounded !== null
      ? item.result.totalPriceRounded : item.result.totalPrice;
  const h = Math.floor(item.result.printTimeHours);
  const m = Math.round((item.result.printTimeHours - h) * 60);
  const timeLabel = [h > 0 ? `${h} ч` : '', m > 0 ? `${m} мин` : ''].filter(Boolean).join(' ') || '—';
  const dateStr = new Date(item.savedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  const rows = [
    item.spoolName ? `<tr><td>Материал</td><td>${item.spoolName}</td></tr>` : '',
    item.printerName ? `<tr><td>Принтер</td><td>${item.printerName}</td></tr>` : '',
    `<tr><td>Вес изделия</td><td>${item.input.partWeight} г</td></tr>`,
    `<tr><td>Время печати</td><td>${timeLabel}</td></tr>`,
    `<tr><td>Количество</td><td>${item.input.quantity} шт.</td></tr>`,
    `<tr><td>Цена за 1 шт.</td><td>${fmtCost(pricePerPiece)}</td></tr>`,
    item.input.quantity > 1
      ? `<tr class="total-row"><td>Итого (${item.input.quantity} шт.)</td><td>${fmtCost(totalPrice)}</td></tr>`
      : '',
  ].filter(Boolean).join('\n');
  return `<!DOCTYPE html>
<html lang="ru"><head><meta charset="UTF-8">
<title>Кошт-лист: ${item.input.partName || 'Изделие'}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#1a1a1a;padding:32px;max-width:680px;margin:0 auto}
  h1{font-size:22px;font-weight:700;margin-bottom:4px}
  .sub{color:#666;font-size:12px;margin-bottom:20px}
  hr{border:none;border-top:1px solid #e0e0e0;margin:16px 0}
  table{width:100%;border-collapse:collapse}
  td{padding:8px 12px;vertical-align:top}
  td:first-child{color:#666;width:45%}
  td:last-child{font-weight:500;text-align:right}
  .total-row td{font-size:16px;font-weight:700;border-top:2px solid #1a1a1a;padding-top:12px}
  .note{background:#f5f5f5;border-left:3px solid #aaa;padding:10px 14px;margin-top:20px;font-style:italic;color:#555;border-radius:2px}
  @media print{body{padding:16px}}
</style></head><body>
  <h1>${item.input.partName || 'Изделие'}</h1>
  <div class="sub">Расчёт от ${dateStr}</div>
  <hr>
  <table>${rows}</table>
  ${item.note ? `<div class="note">💬 ${item.note}</div>` : ''}
</body></html>`;
};

// ─── Кошт-лист диалог ────────────────────────────────────────────────────────

interface CostSheetDialogProps { item: SavedCalculation; onClose: () => void; }

const CostSheetDialog: React.FC<CostSheetDialogProps> = ({ item, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateCostSheetText(item));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const html = generateCostSheetHtml(item);
    const win = window.open('', '_blank', 'width=750,height=650');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); }, 600);
    }
  };

  const pricePerPiece =
    item.result.roundingEnabled && item.result.pricePerPieceRounded !== null
      ? item.result.pricePerPieceRounded : item.result.pricePerPiece;
  const totalPrice =
    item.result.roundingEnabled && item.result.totalPriceRounded !== null
      ? item.result.totalPriceRounded : item.result.totalPrice;
  const h = Math.floor(item.result.printTimeHours);
  const mn = Math.round((item.result.printTimeHours - h) * 60);
  const timeLabel = [h > 0 ? `${h} ч` : '', mn > 0 ? `${mn} мин` : ''].filter(Boolean).join(' ') || '—';

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ArticleIcon color="primary" />
          <span>Кошт-лист</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2.5 }}>
          <Typography variant="h6" fontWeight={700}>{item.input.partName || 'Изделие'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(item.savedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <Stack spacing={0.75}>
            {item.spoolName && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Материал</Typography>
                <Typography variant="body2">{item.spoolName}</Typography>
              </Stack>
            )}
            {item.printerName && (
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Принтер</Typography>
                <Typography variant="body2">{item.printerName}</Typography>
              </Stack>
            )}
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Вес изделия</Typography>
              <Typography variant="body2">{item.input.partWeight} г</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Время печати</Typography>
              <Typography variant="body2">{timeLabel}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Количество</Typography>
              <Typography variant="body2">{item.input.quantity} шт.</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Цена за 1 шт.</Typography>
              <Typography variant="body2" fontWeight={600}>{fmtCost(pricePerPiece)}</Typography>
            </Stack>
            {item.input.quantity > 1 && (
              <Stack direction="row" justifyContent="space-between"
                sx={{ pt: 1, borderTop: '2px solid', borderColor: 'text.primary' }}>
                <Typography fontWeight={700}>Итого ({item.input.quantity} шт.)</Typography>
                <Typography fontWeight={700} color="primary">{fmtCost(totalPrice)}</Typography>
              </Stack>
            )}
          </Stack>
          {item.note && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderLeft: '3px solid', borderColor: 'text.disabled', borderRadius: '0 4px 4px 0' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>💬 {item.note}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Tooltip title={copied ? 'Скопировано!' : 'Скопировать текст'}>
          <Button startIcon={<ContentCopyIcon />} onClick={handleCopy} color={copied ? 'success' : 'inherit'}>
            {copied ? 'Скопировано' : 'Копировать'}
          </Button>
        </Tooltip>
        <Button startIcon={<PrintIcon />} variant="outlined" onClick={handlePrint}>Распечатать</Button>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

// --- HistoryItem -----------------------------------------------------------
interface HistoryItemProps {
  item: SavedCalculation;
  projects: Project[];
  onLoad: (item: SavedCalculation) => void;
  onDelete: (id: string) => void;
  onSetProjectIds: (calcId: string, projectIds: string[]) => void;
  onAddToProfit: (item: SavedCalculation) => void;
  onUpdateNote: (id: string, note: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, projects, onLoad, onDelete, onSetProjectIds, onAddToProfit, onUpdateNote }) => {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [costSheetOpen, setCostSheetOpen] = useState(false);
  const [noteEditing, setNoteEditing] = useState(false);
  const [noteValue, setNoteValue] = useState(item.note ?? '');

  React.useEffect(() => {
    if (!noteEditing) setNoteValue(item.note ?? '');
  }, [item.note, noteEditing]);

  const handleNoteSave = () => {
    onUpdateNote(item.id, noteValue.trim());
    setNoteEditing(false);
  };

  const date = new Date(item.savedAt);
  const dateStr = date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const input = item.input;
  const result = item.result;

  const selectedIds = item.projectIds ?? [];

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
              <Typography fontWeight={600} noWrap>{input.partName || 'Без названия'}</Typography>
              <Typography variant="caption" color="text.secondary">{dateStr} {timeStr}</Typography>
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
            <Typography fontWeight={700} color="primary">{formatMoney(pricePerPiece)}</Typography>
            <Typography variant="caption" color="text.secondary">за 1 шт.</Typography>
            {input.quantity > 1 && (
              <Typography variant="body2" fontWeight={600} color="success.main">
                {formatMoney(totalPrice)} всего
              </Typography>
            )}
          </Stack>
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" mt={1} flexWrap="wrap" gap={0.5}>
          <Button
            size="small"
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Скрыть детали' : 'Показать детали'}
          </Button>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {projects.length > 0 && (
              <Select
                multiple
                size="small"
                value={selectedIds}
                onChange={(e) => onSetProjectIds(item.id, e.target.value as string[])}
                input={<OutlinedInput />}
                renderValue={(sel: string[]) =>
                  sel.length === 0
                    ? 'Без проекта'
                    : sel.length === 1
                    ? (projects.find((p) => p.id === sel[0])?.name ?? '1 проект')
                    : `${sel.length} проекта`
                }
                displayEmpty
                sx={{ fontSize: '0.75rem', height: 28, minWidth: 130 }}
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id} dense>
                    <Checkbox size="small" checked={selectedIds.includes(p.id)} sx={{ py: 0 }} />
                    <ListItemText primary={p.name} primaryTypographyProps={{ variant: 'body2' }} />
                  </MenuItem>
                ))}
              </Select>
            )}
            <Tooltip title="Загрузить в форму">
              <IconButton size="small" color="primary" onClick={() => onLoad(item)}>
                <RestoreIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Добавить в таблицу прибыли">
              <IconButton size="small" color="success" onClick={() => onAddToProfit(item)}>
                <TrendingUpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Кошт-лист (для заказчика)">
              <IconButton size="small" onClick={() => setCostSheetOpen(true)}>
                <ArticleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={item.note ? 'Редактировать комментарий' : 'Добавить комментарий'}>
              <IconButton size="small" color={item.note ? 'primary' : 'default'} onClick={() => setNoteEditing(true)}>
                <CommentIcon fontSize="small" />
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

        {/* ── Комментарий ────────────────────────────────────────────── */}
        {noteEditing ? (
          <Stack direction="row" spacing={1} mt={1} alignItems="flex-start">
            <TextField
              size="small"
              fullWidth
              multiline
              maxRows={3}
              placeholder="Комментарий к расчёту (Ctrl+Enter — сохранить, Esc — отмена)..."
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleNoteSave();
                if (e.key === 'Escape') { setNoteValue(item.note ?? ''); setNoteEditing(false); }
              }}
            />
            <Stack spacing={0.5} flexShrink={0}>
              <Button size="small" variant="contained" sx={{ py: 0.5, minWidth: 52 }} onClick={handleNoteSave}>ОК</Button>
              <Button size="small" sx={{ py: 0.5, minWidth: 52 }} onClick={() => { setNoteValue(item.note ?? ''); setNoteEditing(false); }}>✕</Button>
            </Stack>
          </Stack>
        ) : item.note ? (
          <Stack direction="row" alignItems="flex-start" mt={0.75} spacing={0.5}
            onClick={() => setNoteEditing(true)}
            sx={{ cursor: 'pointer', opacity: 0.7, '&:hover': { opacity: 1 }, transition: 'opacity 0.15s' }}
          >
            <CommentIcon sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {item.note}
            </Typography>
          </Stack>
        ) : null}
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
      {costSheetOpen && <CostSheetDialog item={item} onClose={() => setCostSheetOpen(false)} />}
    </Card>
  );
};

// --- ProjectSection --------------------------------------------------------
interface ProjectSectionProps {
  project: Project;
  items: SavedCalculation[];
  allProjects: Project[];
  onLoad: (item: SavedCalculation) => void;
  onDelete: (id: string) => void;
  onSetProjectIds: (calcId: string, projectIds: string[]) => void;
  onRename: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (id: string, changes: Partial<Project>) => void;
  onAddToProfit: (item: SavedCalculation) => void;
  onAddProjectToProfit: (projectName: string, items: SavedCalculation[]) => void;
  onUpdateNote: (id: string, note: string) => void;
}

const ProjectSection: React.FC<ProjectSectionProps> = ({
  project, items, allProjects, onLoad, onDelete, onSetProjectIds, onRename, onDeleteProject, onUpdateProject, onAddToProfit, onAddProjectToProfit, onUpdateNote,
}) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(project.name);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState(false);
  const [colorAnchor, setColorAnchor] = useState<HTMLElement | null>(null);

  const handleRenameConfirm = () => {
    if (newName.trim()) { onRename(project.id, newName.trim()); setRenameOpen(false); }
  };

  const defectRate = project.defectRate ?? 0;

  const totalSum = items.reduce((acc, item) => {
    const price =
      item.result.roundingEnabled && item.result.totalPriceRounded !== null
        ? item.result.totalPriceRounded
        : item.result.totalPrice;
    return acc + price;
  }, 0);

  const adjustedTotal = defectRate > 0 && defectRate < 100
    ? totalSum / (1 - defectRate / 100)
    : null;

  return (
    <>
      <Accordion disableGutters variant="outlined" sx={{ borderRadius: 1, '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', mr: 1 }} flexWrap="wrap" gap={0.5}>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
              {/* Цвет проекта */}
              <Tooltip title="Цвет проекта">
                <Box
                  onClick={(e) => { e.stopPropagation(); setColorAnchor(e.currentTarget); }}
                  sx={{
                    width: 16, height: 16, borderRadius: '50%',
                    bgcolor: project.color ?? 'primary.main',
                    border: '2px solid', borderColor: 'divider',
                    cursor: 'pointer', flexShrink: 0,
                    '&:hover': { boxShadow: '0 0 0 2px', outline: '2px solid', outlineColor: 'text.secondary' },
                  }}
                />
              </Tooltip>
              <FolderIcon color="primary" fontSize="small" />
              <Typography fontWeight={600}>{project.name}</Typography>
              <Chip size="small" label={`${items.length} шт.`} />
              {items.length > 0 && (
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  {formatMoney(totalSum)}
                </Typography>
              )}
              {adjustedTotal !== null && (
                <Tooltip title={`С учётом ${defectRate}% брака`}>
                  <Typography variant="caption" color="warning.main" fontWeight={600}>
                    ≈{formatMoney(adjustedTotal)} с браком
                  </Typography>
                </Tooltip>
              )}
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {/* Процент брака */}
              <Tooltip title="Ожидаемый % неудачных печатей">
                <TextField
                  label="% брака"
                  type="number"
                  size="small"
                  value={defectRate || ''}
                  placeholder="0"
                  onChange={(e) => { const v = Math.min(99, Math.max(0, parseFloat(e.target.value) || 0)); onUpdateProject(project.id, { defectRate: v }); }}
                  onClick={(e) => e.stopPropagation()}
                  inputProps={{ min: 0, max: 99, step: 1 }}
                  sx={{ width: 90 }}
                />
              </Tooltip>
              {items.length > 0 && (
                <Tooltip title="Добавить весь проект в таблицу прибыли">
                  <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); onAddProjectToProfit(project.name, items); }}>
                    <TrendingUpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Переименовать проект">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setNewName(project.name); setRenameOpen(true); }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Удалить проект (расчёты останутся)">
                <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setConfirmDeleteProject(true); }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </AccordionSummary>

        {/* Цветовой пикер */}
        <Popover
          open={Boolean(colorAnchor)}
          anchorEl={colorAnchor}
          onClose={() => setColorAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          <Stack direction="row" spacing={0.5} sx={{ p: 1 }}>
            {COLOR_PALETTE.map((color) => (
              <Tooltip key={color} title={color}>
                <Box
                  onClick={() => { onUpdateProject(project.id, { color }); setColorAnchor(null); }}
                  sx={{
                    width: 22, height: 22, borderRadius: '50%', bgcolor: color,
                    cursor: 'pointer', border: '2px solid',
                    borderColor: project.color === color ? 'text.primary' : 'transparent',
                    '&:hover': { transform: 'scale(1.2)' },
                    transition: 'transform 0.1s',
                  }}
                />
              </Tooltip>
            ))}
          </Stack>
        </Popover>
        <AccordionDetails sx={{ pt: 0 }}>
          {items.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>В проекте нет расчётов</Typography>
          ) : (
            <Stack spacing={1.5}>
              {items.map((item) => (
                <HistoryItem key={item.id} item={item} projects={allProjects}
                  onLoad={onLoad} onDelete={onDelete} onSetProjectIds={onSetProjectIds}
                  onAddToProfit={onAddToProfit} onUpdateNote={onUpdateNote} />
              ))}
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Переименовать проект</DialogTitle>
        <DialogContent>
          <TextField autoFocus fullWidth size="small" label="Название проекта" value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); }}
            sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleRenameConfirm} disabled={!newName.trim()}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteProject}
        title="Удалить проект?"
        message={`Проект «${project.name}» будет удалён. Расчёты останутся в истории без проекта.`}
        confirmLabel="Удалить"
        onConfirm={() => { onDeleteProject(project.id); setConfirmDeleteProject(false); }}
        onCancel={() => setConfirmDeleteProject(false)}
        danger
      />
    </>
  );
};

// --- HistoryPanel ----------------------------------------------------------
interface Props {
  history: SavedCalculation[];
  projects: Project[];
  onLoad: (item: SavedCalculation) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onCreateProject: (name: string) => Project;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, name: string) => void;
  onSetProjectIds: (calcId: string, projectIds: string[]) => void;
  onUpdateProject: (id: string, changes: Partial<Project>) => void;
  onAddToProfit: (item: SavedCalculation) => void;
  onAddProjectToProfit: (projectName: string, items: SavedCalculation[]) => void;
  onUpdateNote: (id: string, note: string) => void;
}

const HistoryPanel: React.FC<Props> = ({
  history, projects, onLoad, onDelete, onClearAll,
  onCreateProject, onDeleteProject, onRenameProject, onSetProjectIds, onUpdateProject, onAddToProfit, onAddProjectToProfit, onUpdateNote,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [search, setSearch] = useState('');
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [sortMode, setSortMode] = useState<'date' | 'price' | 'name'>('date');

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName('');
      setNewProjectOpen(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? history.filter(
        (h) =>
          (h.input.partName ?? '').toLowerCase().includes(q) ||
          (h.spoolName ?? '').toLowerCase().includes(q) ||
          (h.printerName ?? '').toLowerCase().includes(q)
      )
    : history;

  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'date') {
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    }
    if (sortMode === 'price') {
      const priceA = a.result.roundingEnabled && a.result.totalPriceRounded !== null
        ? a.result.totalPriceRounded : a.result.totalPrice;
      const priceB = b.result.roundingEnabled && b.result.totalPriceRounded !== null
        ? b.result.totalPriceRounded : b.result.totalPrice;
      return priceB - priceA;
    }
    // name
    return (a.input.partName ?? '').localeCompare(b.input.partName ?? '', 'ru');
  });

  const ungrouped = sorted.filter((h) => !h.projectIds || h.projectIds.length === 0);
  const grouped = projects.map((p) => ({
    project: p,
    items: sorted.filter((h) => h.projectIds?.includes(p.id)),
  }));
  const hasAnyGroupedItems = grouped.some(({ items }) => items.length > 0);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Typography variant="h6">
          История расчётов
          {history.length > 0 && (
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              ({history.length} шт.)
            </Typography>
          )}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => { setNewProjectName(''); setNewProjectOpen(true); }}
          >
            Новый проект
          </Button>
          {history.length > 0 && (
            <Button variant="outlined" color="error" size="small" startIcon={<DeleteSweepIcon />}
              onClick={() => setConfirmClear(true)}>
              Очистить всё
            </Button>
          )}
        </Stack>
      </Stack>

      {history.length > 0 && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} mb={2} alignItems={{ sm: 'center' }}>
          <TextField
            fullWidth size="small"
            placeholder="Поиск по названию, катушке, принтеру..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} /> }}
          />
          <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
            <SortIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <ToggleButtonGroup
              value={sortMode}
              exclusive
              onChange={(_, v) => v && setSortMode(v)}
              size="small"
            >
              <ToggleButton value="date" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                По дате
              </ToggleButton>
              <ToggleButton value="price" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                По цене
              </ToggleButton>
              <ToggleButton value="name" sx={{ px: 1.5, py: 0.5, fontSize: '0.75rem' }}>
                По имени
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      )}

      {history.length === 0 && projects.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Typography color="text.secondary">История пуста. Сохраните расчёт из вкладки «Расчёт».</Typography>
        </Box>
      ) : filtered.length === 0 && projects.length === 0 ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Ничего не найдено по запросу «{search}»</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {grouped.map(({ project, items }) => (
            items.length > 0 || !q ? (
              <ProjectSection
                key={project.id}
                project={project}
                items={items}
                allProjects={projects}
                onLoad={onLoad}
                onDelete={onDelete}
                onSetProjectIds={onSetProjectIds}
                onRename={onRenameProject}
                onDeleteProject={onDeleteProject}
                onUpdateProject={onUpdateProject}
                onAddToProfit={onAddToProfit}
                onAddProjectToProfit={onAddProjectToProfit}
                onUpdateNote={onUpdateNote}
              />
            ) : null
          ))}

          {filtered.length === 0 && q ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">Ничего не найдено по запросу «{search}»</Typography>
            </Box>
          ) : ungrouped.length > 0 ? (
            <>
              {hasAnyGroupedItems && (
                <Divider>
                  <Typography variant="caption" color="text.secondary">Без проекта</Typography>
                </Divider>
              )}
              {ungrouped.map((item) => (
                <HistoryItem key={item.id} item={item} projects={projects}
                  onLoad={onLoad} onDelete={onDelete} onSetProjectIds={onSetProjectIds}
                  onAddToProfit={onAddToProfit} onUpdateNote={onUpdateNote} />
              ))}
            </>
          ) : null}
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

      <Dialog open={newProjectOpen} onClose={() => setNewProjectOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FolderOpenIcon color="primary" />
            <span>Новый проект</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth size="small"
            label="Название проекта"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateProject(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewProjectOpen(false)}>Отмена</Button>
          <Button variant="contained" onClick={handleCreateProject} disabled={!newProjectName.trim()}>
            Создать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryPanel;
