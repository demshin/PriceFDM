import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import type { SpoolProfile, PlasticType } from '../../types';
import ConfirmDialog from '../common/ConfirmDialog';
import { generateId } from '../../utils/storage';
import { parseFilamentPresetsZip, presetToSpool, type FilamentPresetRecord } from '../../utils/filamentPresets';
import { useTranslation } from '../../i18n/useTranslation';

const PLASTIC_TYPES: PlasticType[] = ['PLA', 'PETG', 'ABS', 'TPU', 'Nylon', 'Другой'];

const ColorDot: React.FC<{ color: string }> = ({ color }) => (
  <Box
    sx={{
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: color || '#ccc',
      border: '2px solid',
      borderColor: 'divider',
      flexShrink: 0,
    }}
  />
);

interface SpoolDialogProps {
  open: boolean;
  initial?: SpoolProfile | null;
  onSave: (p: SpoolProfile) => void;
  onClose: () => void;
}

const emptyProfile = (): Omit<SpoolProfile, 'id'> => ({
  name: '',
  plasticType: 'PLA',
  color: '#1976d2',
  price: 0,
  weight: 1000,
  note: '',
});

const SpoolDialog: React.FC<SpoolDialogProps> = ({ open, initial, onSave, onClose }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<Omit<SpoolProfile, 'id'>>(
    initial ? { ...initial } : emptyProfile()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : emptyProfile());
      setErrors({});
    }
  }, [open, initial]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t.spools_name;
    if (form.price < 0) errs.price = t.common_price;
    if (form.weight <= 0) errs.weight = t.common_weight;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: initial?.id ?? generateId(),
      ...form,
      price: Number(form.price),
      weight: Number(form.weight),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? t.spools_edit : t.spools_new}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label={t.spools_name}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
            fullWidth
            size="small"
          />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel>{t.spools_type}</InputLabel>
                <Select
                  value={form.plasticType}
                  label={t.spools_type}
                  onChange={(e) => set('plasticType', e.target.value as PlasticType)}
                >
                  {PLASTIC_TYPES.map((pt) => (
                    <MenuItem key={pt} value={pt}>{pt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {t.spools_color}
                </Typography>
                <Box
                  component="input"
                  type="color"
                  value={form.color}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => set('color', e.target.value)}
                  sx={{
                    width: 44,
                    height: 36,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {form.color}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t.spools_price}
                type="number"
                value={form.price}
                onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                error={!!errors.price}
                helperText={errors.price}
                inputProps={{ min: 0, step: 0.01 }}
                InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>₽</Box> }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t.spools_weight}
                type="number"
                value={form.weight}
                onChange={(e) => set('weight', parseFloat(e.target.value) || 0)}
                error={!!errors.weight}
                helperText={errors.weight || t.spools_default_weight}
                inputProps={{ min: 1, step: 1 }}
                InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>{t.common_grams}</Box> }}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
          <TextField
            label={t.spools_optional_note}
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
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

interface Props {
  spools: SpoolProfile[];
  onUpdate: (spools: SpoolProfile[]) => void;
}

const SpoolProfilesManager: React.FC<Props> = ({ spools, onUpdate }) => {
  const { t, lang } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SpoolProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SpoolProfile | null>(null);

  // --- ZIP import state ---
  const zipInputRef = useRef<HTMLInputElement>(null);
  const [instructionDialogOpen, setInstructionDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError]   = useState<string | null>(null);
  const [importRecords, setImportRecords] = useState<FilamentPresetRecord[]>([]);
  const [importSelected, setImportSelected] = useState<Set<number>>(new Set());

  const handleZipFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setInstructionDialogOpen(false);
    setImportError(null);
    setImportLoading(true);
    setImportRecords([]);
    setImportSelected(new Set());
    setImportDialogOpen(true);
    try {
      const records = await parseFilamentPresetsZip(file);
      if (records.length === 0) {
        setImportError(t.spools_import_tooltip);
      } else {
        setImportRecords(records);
        setImportSelected(new Set(records.map((_, i) => i)));
      }
    } catch (err) {
      setImportError(`${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportConfirm = () => {
    const newSpools = [...importRecords]
      .filter((_, i) => importSelected.has(i))
      .map(presetToSpool);
    onUpdate([...spools, ...newSpools]);
    setImportDialogOpen(false);
    setImportRecords([]);
    setImportSelected(new Set());
  };

  const toggleImportItem = (i: number) => {
    setImportSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const toggleImportAll = () => {
    if (importSelected.size === importRecords.length) {
      setImportSelected(new Set());
    } else {
      setImportSelected(new Set(importRecords.map((_, i) => i)));
    }
  };

  const handleSave = (profile: SpoolProfile) => {
    const existing = spools.find((s) => s.id === profile.id);
    if (existing) {
      onUpdate(spools.map((s) => (s.id === profile.id ? profile : s)));
    } else {
      onUpdate([...spools, profile]);
    }
    setDialogOpen(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    onUpdate(spools.filter((s) => s.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const openNew = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (s: SpoolProfile) => {
    setEditTarget(s);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Stack spacing={1.5} mb={2}>
        <Typography variant="h6">{t.spools_title}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Tooltip title={t.spools_import_tooltip}>
            <Button
              variant="outlined"
              startIcon={importLoading ? <CircularProgress size={16} /> : <FileUploadIcon />}
              onClick={() => setInstructionDialogOpen(true)}
              disabled={importLoading}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              {t.spools_import}
            </Button>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} sx={{ flex: { xs: 1, sm: 'none' } }}>
            {t.spools_add}
          </Button>
        </Stack>
      </Stack>

      {spools.length === 0 ? (
        <Box
          sx={{
            py: 6,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary" gutterBottom>
            {t.spools_empty}
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={openNew} sx={{ maxWidth: '100%' }}>
            {t.spools_add_first}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {spools.map((spool) => {
            const gramCost = spool.weight > 0 ? spool.price / spool.weight : 0;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={spool.id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                        <ColorDot color={spool.color} />
                        <Typography fontWeight={600} noWrap title={spool.name}>
                          {spool.name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title={t.common_edit}>
                          <IconButton size="small" onClick={() => openEdit(spool)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t.common_delete}>
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(spool)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">{t.common_type}</Typography>
                        <Chip label={spool.plasticType} size="small" />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">{t.common_price}</Typography>
                        <Typography variant="body2" fontWeight={500}>{spool.price.toLocaleString('ru-RU')} ₽</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">{t.common_weight}</Typography>
                        <Typography variant="body2">{spool.weight} {t.common_grams}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">{t.spools_per_gram_label}</Typography>
                        <Typography variant="body2" color="primary" fontWeight={600}>
                          {gramCost.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
                        </Typography>
                      </Stack>
                      {spool.note && (
                        <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
                          {spool.note}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <SpoolDialog
        open={dialogOpen}
        initial={editTarget}
        onSave={handleSave}
        onClose={() => { setDialogOpen(false); setEditTarget(null); }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t.spools_delete_title}
        message={`«${deleteTarget?.name}» ${t.spools_delete_msg}`}
        confirmLabel={t.common_delete}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />

      {/* === Диалог инструкции экспорта === */}
      <Dialog open={instructionDialogOpen} onClose={() => setInstructionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t.spools_how_to_import_title}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2.5 }}>
            OrcaSlicer / PrusaSlicer — <b>filament_cost</b>
          </Alert>
          <Stack spacing={2}>
            {[1,2,3,4,5,6].map((n) => (
              <Stack key={n} direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    bgcolor: 'primary.main', color: 'primary.contrastText',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.85rem',
                  }}
                >
                  {n}
                </Box>
                <Typography variant="body2" sx={{ pt: 0.5, lineHeight: 1.6 }}>
                  {n === 1 && (lang === 'en' ? 'Open your slicer (OrcaSlicer or PrusaSlicer).' : 'Зайдите в свой слайсер (OrcaSlicer или PrusaSlicer).')}
                  {n === 2 && (lang === 'en' ? <>In the top menu click <b>File</b>.</> : <>В верхнем меню нажмите <b>Файл</b>.</>)}
                  {n === 3 && (lang === 'en' ? <>Hover over <b>Export</b> → <b>Export config bundle…</b></> : <>Наведите на <b>Экспорт</b> → <b>Экспорт пакета профилей…</b></>)}
                  {n === 4 && (lang === 'en' ? <>In the dialog select <b>Filament presets (.zip)</b>.</> : <>В окне выберите <b>Filament presets (.zip)</b>.</>)}
                  {n === 5 && (lang === 'en' ? <>Select the presets you need and click <b>Ok</b>.</> : <>Отметьте нужные пресеты и нажмите <b>Ок</b>.</>)}
                  {n === 6 && (lang === 'en' ? 'Upload the ZIP file using the button below.' : 'Загрузите полученный ZIP-файл нажав кнопку ниже.')}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Divider sx={{ my: 2.5 }} />
          <Stack alignItems="center">
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip"
              style={{ display: 'none' }}
              onChange={handleZipFile}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<FileUploadIcon />}
              onClick={() => zipInputRef.current?.click()}
              sx={{ px: 4 }}
            >
              {t.spools_select_zip}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Filament presets.zip
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInstructionDialogOpen(false)}>{t.common_close}</Button>
        </DialogActions>
      </Dialog>

      {/* === Диалог импорта === */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t.spools_import_select_title}</DialogTitle>
        <DialogContent>
          {importLoading && (
            <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
              <CircularProgress />
              <Typography color="text.secondary">{t.common_reading}</Typography>
            </Stack>
          )}
          {!importLoading && importError && (
            <Alert severity="warning" sx={{ mb: 2 }}>{importError}</Alert>
          )}
          {!importLoading && importRecords.length > 0 && (
            <>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  {t.spools_import_found} {importRecords.length}. {t.spools_import_selected}: {importSelected.size}
                </Typography>
                <Button size="small" onClick={toggleImportAll}>
                  {importSelected.size === importRecords.length ? t.common_deselect_all : t.common_select_all}
                </Button>
              </Stack>
              <Divider sx={{ mb: 1 }} />
              <Stack spacing={0.5} sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {importRecords.map((rec, i) => (
                  <Stack
                    key={i}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{
                      p: 0.75,
                      borderRadius: 1,
                      bgcolor: importSelected.has(i) ? 'action.selected' : 'transparent',
                    }}
                  >
                    <Checkbox
                      size="small"
                      checked={importSelected.has(i)}
                      onChange={() => toggleImportItem(i)}
                      sx={{ p: 0.5 }}
                    />
                    <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: rec.color, flexShrink: 0, border: '1.5px solid', borderColor: 'divider' }} />
                    <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }} noWrap>
                      {rec.name}
                    </Typography>
                    <Chip label={rec.plasticType} size="small" sx={{ flexShrink: 0 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {rec.pricePerKg.toLocaleString('ru-RU')} ₽/кг
                    </Typography>
                  </Stack>
                ))}
              </Stack>
              <Divider sx={{ mt: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {t.spools_import_note}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>{t.common_close}</Button>
          <Button
            variant="contained"
            onClick={handleImportConfirm}
            disabled={importSelected.size === 0 || importLoading}
          >
            {t.common_add} {importSelected.size > 0 ? `(${importSelected.size})` : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpoolProfilesManager;
