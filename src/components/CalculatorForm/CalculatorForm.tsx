import React, { useRef, useState } from 'react';
import {
  Alert,
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
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import type { PrintCalculationInput, SpoolProfile, PrinterProfile, ProcessingItem, PlasticType, WarehouseItem } from '../../types';
import { COMPLEXITY_OPTIONS } from '../../utils/defaults';
import { parseGcode } from '../../utils/gcode';
import { useTranslation } from '../../i18n/useTranslation';

/** Нормализует тип пластика из G-code в PlasticType */
function normalizePlasticType(ft: string): PlasticType {
  const u = ft.toUpperCase();
  if (u.includes('PETG') || (u.includes('PET') && !u.includes('PETG') === false)) return 'PETG';
  if (u.includes('TPU') || u.includes('FLEX') || u.includes('TPE')) return 'TPU';
  if (u.includes('ABS') || u.includes('ASA')) return 'ABS';
  if (u.includes('NYLON') || u.startsWith('PA')) return 'Nylon';
  if (u.includes('PLA')) return 'PLA';
  return 'Другой';
}

interface ColorDotProps { color: string }
const ColorDot: React.FC<ColorDotProps> = ({ color }) => (
  <Box sx={{ width: 14, height: 14, borderRadius: '50%', background: color || '#ccc', border: '1px solid', borderColor: 'divider', flexShrink: 0 }} />
);

interface Props {
  input: PrintCalculationInput;
  onChange: (input: PrintCalculationInput) => void;
  spools: SpoolProfile[];
  printers: PrinterProfile[];
  warehouse?: WarehouseItem[];
  errors: Record<string, string>;
  onClear?: () => void;
}

const CalculatorForm: React.FC<Props> = ({ input, onChange, spools, printers, warehouse, errors, onClear }) => {
  const { t } = useTranslation();
  const gcodeInputRef = useRef<HTMLInputElement>(null);
  const [gcodeMessage, setGcodeMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [gcodeModelWeightMissing, setGcodeModelWeightMissing] = useState(false);
  const [gcodeIsMulticolor, setGcodeIsMulticolor] = useState(false);
  const [warehouseDialogOpen, setWarehouseDialogOpen] = useState(false);

  const set = <K extends keyof PrintCalculationInput>(key: K, value: PrintCalculationInput[K]) => {
    onChange({ ...input, [key]: value });
  };

  const effectiveModelWeight = (w: number) =>
    input.modelWeight > 0 ? input.modelWeight : (input.partWeight > 0 ? input.partWeight : w);

  const handleWeightChange = (field: 'partWeight' | 'modelWeight', value: number) => {
    const newInput = { ...input, [field]: value };
    const newModelW = field === 'modelWeight' ? value : input.modelWeight;
    const newPartW  = field === 'partWeight'  ? value : input.partWeight;
    const effW = newModelW > 0 ? newModelW : newPartW;
    const updatedItems = newInput.processing.items.map((item) => {
      if (item.costMode === 'per_gram' && item.ratePerGram && item.enabled && effW > 0) {
        return { ...item, cost: parseFloat((item.ratePerGram * effW).toFixed(2)) };
      }
      return item;
    });
    onChange({ ...newInput, processing: { ...newInput.processing, items: updatedItems } });
  };

  const handleGcodeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseGcode(text);
      const updates: Partial<PrintCalculationInput> = {};
      if (parsed.weightGrams      !== undefined) updates.partWeight  = parsed.weightGrams;
      if (parsed.modelWeightGrams !== undefined) updates.modelWeight = parsed.modelWeightGrams;
      setGcodeModelWeightMissing(parsed.weightGrams !== undefined && parsed.modelWeightGrams === undefined);
      setGcodeIsMulticolor(parsed.isMulticolor === true);
      if (parsed.printHours       !== undefined) updates.printHours   = parsed.printHours;
      if (parsed.printMinutes     !== undefined) updates.printMinutes = parsed.printMinutes;

      // --- Автоподбор катушки ---
      let autoSpoolNote = '';
      if (parsed.filamentType && !input.spoolProfileId) {
        const normalizedType = normalizePlasticType(parsed.filamentType);
        // Приоритет 1: совпадение по названию пресета
        let matched: SpoolProfile | undefined;
        if (parsed.filamentSettingsId) {
          const sid = parsed.filamentSettingsId.toLowerCase();
          matched = spools.find((s) => s.name.toLowerCase().includes(sid) || sid.includes(s.name.toLowerCase()));
        }
        // Приоритет 2: единственная катушка с нужным типом
        if (!matched) {
          const byType = spools.filter((s) => s.plasticType === normalizedType);
          if (byType.length === 1) {
            matched = byType[0];
          } else if (byType.length > 1) {
            autoSpoolNote = `найдено ${byType.length} катушки ${normalizedType} — выберите вручную`;
          }
        }
        if (matched) {
          updates.spoolProfileId = matched.id;
          updates.spoolPrice = matched.price;
          updates.spoolWeight = matched.weight;
          autoSpoolNote = `катушка: ${matched.name}`;
        }
      }

      const newInput = { ...input, ...updates };
      if (parsed.weightGrams !== undefined) {
        const effW = newInput.modelWeight > 0 ? newInput.modelWeight : newInput.partWeight;
        const updatedItems = newInput.processing.items.map((item) => {
          if (item.costMode === 'per_gram' && item.ratePerGram && item.enabled && effW > 0) {
            return { ...item, cost: parseFloat((item.ratePerGram * effW).toFixed(2)) };
          }
          return item;
        });
        onChange({ ...newInput, processing: { ...newInput.processing, items: updatedItems } });
      } else {
        onChange(newInput);
      }
      const parts: string[] = [];
      if (parsed.weightGrams !== undefined) {
        const modelNote = parsed.modelWeightGrams !== undefined
          ? ` (модель: ${parsed.modelWeightGrams} г)`
          : '';
        parts.push(`общий вес: ${parsed.weightGrams} г${modelNote}`);
      }
      if (parsed.printHours !== undefined || parsed.printMinutes !== undefined) {
        const h = parsed.printHours ?? 0;
        const m = parsed.printMinutes ?? 0;
        parts.push(`время: ${h ? `${h} ч ` : ''}${m ? `${m} мин` : ''}`.trim());
      }
      if (autoSpoolNote) parts.push(autoSpoolNote);
      if (parsed.isMulticolor) parts.push('🌈 цветная печать');
      if (parts.length > 0) {
        setGcodeMessage({ text: `${parsed.slicerName ?? 'G-code'}: ${parts.join(', ')}`, ok: true });
      } else {
        setGcodeMessage({ text: 'Не удалось распознать данные в файле', ok: false });
      }
      setTimeout(() => setGcodeMessage(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSpoolSelect = (id: string) => {
    const spool = spools.find((s) => s.id === id);
    if (!spool) { onChange({ ...input, spoolProfileId: undefined }); return; }
    onChange({ ...input, spoolProfileId: spool.id, spoolPrice: spool.price, spoolWeight: spool.weight });
  };

  const handlePrinterSelect = (id: string) => {
    const printer = printers.find((p) => p.id === id);
    if (!printer) { onChange({ ...input, printerProfileId: undefined }); return; }
    onChange({ ...input, printerProfileId: printer.id, powerWatts: printer.powerWatts, printerCost: printer.printerCost, printerLifeHours: printer.lifeHours });
  };

  const handleProcessingItemToggle = (itemId: string, enabled: boolean) => {
    const effW = effectiveModelWeight(0);
    const updatedItems = input.processing.items.map((item) => {
      if (item.id !== itemId) return item;
      if (enabled && item.costMode === 'per_gram' && item.ratePerGram && effW > 0) {
        return { ...item, enabled, cost: parseFloat((item.ratePerGram * effW).toFixed(2)) };
      }
      return { ...item, enabled };
    });
    onChange({ ...input, processing: { ...input.processing, items: updatedItems } });
  };

  const updateProcessingItem = (itemId: string, updates: Partial<ProcessingItem>) => {
    onChange({ ...input, processing: { ...input.processing, items: input.processing.items.map((item) => item.id === itemId ? { ...item, ...updates } : item) } });
  };

  const addCustomProcessingItem = () => {
    const newItem: ProcessingItem = {
      id: 'custom_' + Date.now().toString(36),
      name: '',
      enabled: true,
      cost: 0,
      costMode: 'fixed',
      isCustom: true,
    };
    onChange({ ...input, processing: { ...input.processing, items: [...input.processing.items, newItem] } });
  };

  const removeCustomItem = (itemId: string) => {
    onChange({ ...input, processing: { ...input.processing, items: input.processing.items.filter((item) => item.id !== itemId) } });
  };

  const selectedSpool   = spools.find((s) => s.id === input.spoolProfileId);
  const selectedPrinter = printers.find((p) => p.id === input.printerProfileId);
  const gramCost = input.spoolWeight > 0 && input.spoolPrice > 0 ? input.spoolPrice / input.spoolWeight : 0;

  return (
    <Stack spacing={2.5}>

      {/* === Импорт G-code === */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          {onClear && (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<DeleteOutlineIcon />}
              onClick={onClear}
            >
              Очистить
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            size="small"
            onClick={() => gcodeInputRef.current?.click()}
          >
            {t.calc_import_gcode}
          </Button>
          <Typography variant="caption" color="text.secondary">
            {t.calc_gcode_hint}
          </Typography>
        </Stack>
        <input
          ref={gcodeInputRef}
          type="file"
          accept=".gcode,.gco,.nc,text/plain"
          style={{ display: 'none' }}
          onChange={handleGcodeFile}
        />
        <Collapse in={gcodeMessage !== null}>
          {gcodeMessage && (
            <Alert
              severity={gcodeMessage.ok ? 'success' : 'warning'}
              sx={{ mt: 1 }}
              onClose={() => setGcodeMessage(null)}
            >
              {gcodeMessage.text}
            </Alert>
          )}
        </Collapse>
      </Box>

      {/* === Основные параметры === */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
            {t.calc_main_params}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label={t.calc_part_name}
              value={input.partName}
              onChange={(e) => set('partName', e.target.value)}
              error={!!errors.partName}
              helperText={errors.partName}
              fullWidth
              size="small"
              placeholder="Например: Крышка корпуса"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t.calc_part_weight}
                  type="number"
                  value={input.partWeight || ''}
                  onChange={(e) => handleWeightChange('partWeight', parseFloat(e.target.value) || 0)}
                  error={!!errors.partWeight}
                  helperText={errors.partWeight || t.calc_with_supports}
                  inputProps={{ min: 0, step: 0.1 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>г</Box> }}
                  fullWidth
                  size="small"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t.calc_model_weight}
                  type="number"
                  value={input.modelWeight || ''}
                  onChange={(e) => handleWeightChange('modelWeight', parseFloat(e.target.value) || 0)}
                  helperText={
                    gcodeModelWeightMissing && !input.modelWeight
                      ? t.calc_model_weight_missing
                      : t.calc_without_supports
                  }
                  inputProps={{ min: 0, step: 0.1 }}
                  InputProps={{
                    endAdornment: (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {gcodeModelWeightMissing && !input.modelWeight && (
                          <Tooltip
                            title={t.calc_model_weight_tooltip}
                            arrow
                            placement="top"
                          >
                            <InfoOutlinedIcon
                              fontSize="small"
                              color="warning"
                              sx={{ cursor: 'help', mr: 0.5 }}
                            />
                          </Tooltip>
                        )}
                        <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.85em' }}>{t.common_grams}</Box>
                      </Box>
                    ),
                  }}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Количество + оптовый заказ */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t.calc_quantity_parts}
                  type="number"
                  value={input.quantity}
                  onChange={(e) => set('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, step: 1 }}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            {input.quantity > 1 && (
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={input.wholesaleEnabled ?? false}
                      size="small"
                      onChange={(e) => set('wholesaleEnabled', e.target.checked)}
                    />
                  }
                  label={
                    <Stack>
                      <Typography variant="body2" fontWeight={600}>{t.calc_wholesale}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.calc_wholesale_desc}</Typography>
                    </Stack>
                  }
                />
                {(input.wholesaleEnabled ?? false) && (
                  <TextField
                    label={t.calc_wholesale_discount}
                    type="number"
                    value={input.wholesaleDiscount ?? 10}
                    onChange={(e) => set('wholesaleDiscount', Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>%</Box> }}
                    helperText={t.calc_wholesale_default}
                    sx={{ width: 200, mt: 1 }}
                    size="small"
                  />
                )}
              </Box>
            )}

            {/* Время печати */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Время печати
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label={t.calc_hours}
                    type="number"
                    value={input.printHours}
                    onChange={(e) => set('printHours', Math.max(0, parseInt(e.target.value) || 0))}
                    inputProps={{ min: 0, step: 1 }}
                    InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>ч</Box> }}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label={t.calc_minutes}
                    type="number"
                    value={input.printMinutes}
                    onChange={(e) => set('printMinutes', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    inputProps={{ min: 0, max: 59, step: 5 }}
                    InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>мин</Box> }}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* === Сложность модели === */}
      <Card variant="outlined">
        <CardContent>
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 0.5, fontWeight: 600, color: 'primary.main', fontSize: '0.95rem' }}>
              {t.calc_complexity}
            </FormLabel>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              {t.calc_complexity_desc}
            </Typography>
            <RadioGroup
              value={String(input.complexityCoefficient)}
              onChange={(e) => {
                const opt = COMPLEXITY_OPTIONS.find((o) => String(o.value) === e.target.value);
                if (opt) onChange({ ...input, complexityCoefficient: opt.value, complexityLabel: opt.label });
              }}
            >
              <Grid container spacing={1}>
                {COMPLEXITY_OPTIONS.map((opt) => {
                  const selected = input.complexityCoefficient === opt.value;
                  return (
                    <Grid key={opt.value} size={{ xs: 12, sm: 6 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 1,
                          cursor: 'pointer',
                          borderColor: selected ? 'primary.main' : 'divider',
                          bgcolor: selected ? 'primary.50' : 'background.paper',
                          transition: 'all 0.15s',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                        onClick={() => onChange({ ...input, complexityCoefficient: opt.value, complexityLabel: opt.label })}
                      >
                        <FormControlLabel
                          value={String(opt.value)}
                          control={<Radio size="small" />}
                          label={
                            <Stack>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="body2" fontWeight={selected ? 700 : 400}>{opt.label}</Typography>
                                <Typography variant="caption" color="primary.main" fontWeight={600}>×{opt.value}</Typography>
                              </Stack>
                              <Typography variant="caption" color="text.secondary">{opt.description}</Typography>
                            </Stack>
                          }
                          sx={{ m: 0, width: '100%' }}
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </RadioGroup>
          </FormControl>
        </CardContent>
      </Card>

      {/* === Материал === */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
            {t.calc_material}
          </Typography>
          <Stack spacing={2}>
            {spools.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>{t.calc_spool_profile}</InputLabel>
                <Select
                  value={input.spoolProfileId || ''}
                  label={t.calc_spool_profile}
                  onChange={(e) => handleSpoolSelect(e.target.value)}
                  renderValue={(v) => {
                    const s = spools.find((x) => x.id === v);
                    if (!s) return t.calc_not_selected;
                    return (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ColorDot color={s.color} />
                        <span>{s.name}</span>
                        <Typography variant="caption" color="text.secondary">({s.plasticType})</Typography>
                      </Stack>
                    );
                  }}
                >
                  <MenuItem value=""><em>Не выбран</em></MenuItem>
                  {spools.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ColorDot color={s.color} />
                        <span>{s.name}</span>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {s.plasticType} · {s.price} ₽/{s.weight} г
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {selectedSpool && (
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <ColorDot color={selectedSpool.color} />
                    <Typography variant="caption">{selectedSpool.color}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{t.calc_type_label} <strong>{selectedSpool.plasticType}</strong></Typography>
                  <Typography variant="caption" color="text.secondary">{t.calc_gram_price_label} <strong>{gramCost.toFixed(2)} ₽</strong></Typography>
                  {gcodeIsMulticolor && (
                    <Chip label={`🌈 ${t.calc_colorful}`} size="small" color="secondary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                  )}
                </Stack>
              </Paper>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    label={t.calc_spool_price}
                    type="number"
                    value={input.spoolPrice || ''}
                    onChange={(e) => set('spoolPrice', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: 10 }}
                    InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
                    helperText={selectedSpool ? t.calc_from_profile : undefined}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                    label={t.calc_spool_weight}
                    type="number"
                    value={input.spoolWeight}
                    onChange={(e) => set('spoolWeight', parseFloat(e.target.value) || 1000)}
                    inputProps={{ min: 1, step: 50 }}
                    InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>{t.common_grams}</Box> }}
                    helperText={selectedSpool ? t.calc_from_profile : t.calc_default_1000g}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* === Принтер и электроэнергия === */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
            {t.calc_printer_elec}
          </Typography>
          <Stack spacing={2}>
            {printers.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>{t.calc_printer_profile}</InputLabel>
                <Select
                  value={input.printerProfileId || ''}
                  label={t.calc_printer_profile}
                  onChange={(e) => handlePrinterSelect(e.target.value)}
                >
                  <MenuItem value=""><em>{t.calc_not_selected}</em></MenuItem>
                  {printers.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name} · {p.powerWatts} Вт</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t.calc_power}
                  type="number"
                  value={input.powerWatts}
                  onChange={(e) => set('powerWatts', parseFloat(e.target.value) || 220)}
                  inputProps={{ min: 1, step: 10 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>{t.common_watts}</Box> }}
                  helperText={selectedPrinter ? t.calc_from_profile : `${t.common_default_label} 220 ${t.common_watts}`}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t.calc_electricity_cost}
                  type="number"
                  value={input.electricityCostPerKwh}
                  onChange={(e) => set('electricityCostPerKwh', parseFloat(e.target.value) || 6)}
                  inputProps={{ min: 0, step: 0.1 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽/кВт⋅ч</Box> }}
                  helperText={t.settings_elec_tooltip}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t.calc_printer_cost}
                  type="number"
                  value={input.printerCost}
                  onChange={(e) => set('printerCost', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 1000 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
                  helperText={selectedPrinter ? t.calc_from_profile : undefined}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t.calc_printer_life}
                  type="number"
                  value={input.printerLifeHours}
                  onChange={(e) => set('printerLifeHours', parseFloat(e.target.value) || 3000)}
                  inputProps={{ min: 1, step: 100 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>{t.common_hour_short}</Box> }}
                  helperText={selectedPrinter ? t.calc_from_profile : `${t.common_default_label} 3000 ${t.common_hour_short}`}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* === Обработка === */}
      <Card variant="outlined">
        <CardContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={input.processing.enabled}
                onChange={(e) => onChange({ ...input, processing: { ...input.processing, enabled: e.target.checked } })}
              />
            }
            label={<Typography variant="subtitle1" fontWeight={600} color="primary">{t.calc_processing}</Typography>}
          />

          {input.processing.enabled && (
            <Stack spacing={1.5} sx={{ mt: 1.5 }}>
              {input.processing.items.map((item) => {
                const effW = effectiveModelWeight(0);
                const autoComputedCost = item.costMode === 'per_gram' && item.ratePerGram && effW > 0
                  ? parseFloat((item.ratePerGram * effW).toFixed(2))
                  : null;
                const rateHint = item.costMode === 'per_gram' && item.ratePerGram
                  ? `${item.ratePerGram} ₽/г${effW > 0 ? ` × ${effW} г = ${autoComputedCost} ₽` : ' (введите вес модели)'}`
                  : item.costMode === 'fixed' && !item.isCustom
                  ? `По умолч. ${item.cost > 0 ? item.cost : '—'} ₽`
                  : undefined;

                return (
                  <Box key={item.id}>
                    <Grid container alignItems="flex-start" spacing={1}>
                      <Grid size={{ xs: 12, sm: item.isCustom ? 4 : 5 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={item.enabled}
                              size="small"
                              onChange={(e) => handleProcessingItemToggle(item.id, e.target.checked)}
                            />
                          }
                          label={
                            item.isCustom ? (
                              <TextField
                                value={item.name}
                                onChange={(e) => updateProcessingItem(item.id, { name: e.target.value })}
                                placeholder="Название этапа"
                                size="small"
                                variant="standard"
                                sx={{ width: 140 }}
                              />
                            ) : (
                              <Stack>
                                <Typography variant="body2">{item.name}</Typography>
                                {rateHint && (
                                  <Typography variant="caption" color="text.secondary">{rateHint}</Typography>
                                )}
                              </Stack>
                            )
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: item.isCustom ? 7 : 7 }}>
                        {item.enabled && (
                          <TextField
                            label={t.common_cost}
                            type="number"
                            value={item.cost || ''}
                            onChange={(e) => updateProcessingItem(item.id, { cost: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: item.costMode === 'per_gram' ? 0.1 : 10 }}
                            InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
                            helperText={item.costMode === 'per_gram' && autoComputedCost !== null ? t.calc_auto_computed : undefined}
                            size="small"
                            fullWidth
                          />
                        )}
                      </Grid>
                      {item.isCustom && (
                        <Grid size={{ xs: 'auto' }}>
                          <Tooltip title={t.common_delete}>
                            <IconButton size="small" color="error" onClick={() => removeCustomItem(item.id)} sx={{ mt: 0.5 }}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      )}
                    </Grid>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                );
              })}

              <Button
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                onClick={addCustomProcessingItem}
                sx={{ alignSelf: 'flex-start' }}
              >
                {t.calc_add_custom}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* === Дополнительные расходы === */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
            {t.calc_extra_costs}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Прочие расходы"
              type="number"
              value={input.extraCost || ''}
              onChange={(e) => set('extraCost', parseFloat(e.target.value) || 0)}
              inputProps={{ min: 0, step: 10 }}
              InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
              helperText={t.calc_extra_costs_hint}
              fullWidth
              size="small"
            />
            {warehouse && warehouse.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<WarehouseIcon />}
                onClick={() => setWarehouseDialogOpen(true)}
              >
                {t.calc_add_from_warehouse}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* === Прибыль === */}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">{t.calc_profit}</Typography>
            <Tooltip title="Прибыль добавляется к себестоимости для получения итоговой цены">
              <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Stack>

          <RadioGroup row value={input.profitMode} onChange={(e) => set('profitMode', e.target.value as 'percent' | 'fixed')}>
            <FormControlLabel value="percent" control={<Radio size="small" />} label={t.calc_profit_percent} />
            <FormControlLabel value="fixed" control={<Radio size="small" />} label={t.calc_profit_fixed} />
          </RadioGroup>

          <Box sx={{ mt: 1.5 }}>
            {input.profitMode === 'percent' ? (
              <TextField
                label={t.calc_profit_percent}
                type="number"
                value={input.profitValue}
                onChange={(e) => set('profitValue', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 1 }}
                InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>%</Box> }}
                helperText={`${t.common_default_label} 30%`}
                sx={{ width: 200 }}
                size="small"
              />
            ) : (
              <TextField
                label={t.calc_profit_fixed}
                type="number"
                value={input.profitValue}
                onChange={(e) => set('profitValue', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 10 }}
                InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
                sx={{ width: 200 }}
                size="small"
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* === Округление === */}
      <Card variant="outlined">
        <CardContent>
          <FormControlLabel
            control={<Checkbox checked={input.roundingEnabled} onChange={(e) => set('roundingEnabled', e.target.checked)} />}
            label={
              <Stack>
                <Typography variant="subtitle1" fontWeight={600} color="primary">{t.calc_rounding}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.calc_rounding_desc}
                </Typography>
              </Stack>
            }
          />
        </CardContent>
      </Card>

      {/* === Диалог выбора со склада === */}
      {warehouse && warehouse.length > 0 && (
        <Dialog open={warehouseDialogOpen} onClose={() => setWarehouseDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{t.calc_add_from_warehouse}</DialogTitle>
          <DialogContent>
            <List dense>
              {warehouse.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton onClick={() => {
                    set('extraCost', (input.extraCost || 0) + item.price);
                    setWarehouseDialogOpen(false);
                  }}>
                    <ListItemText
                      primary={`${item.name} — ${item.price.toLocaleString('ru-RU')} ₽`}
                      secondary={`${item.category} · ${item.quantity} ${item.unit}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWarehouseDialogOpen(false)}>{t.common_cancel}</Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
};

export default CalculatorForm;
