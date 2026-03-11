import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
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
import type { PrintCalculationInput, SpoolProfile, PrinterProfile, ProcessingItem } from '../../types';
import { COMPLEXITY_OPTIONS } from '../../utils/defaults';

interface ColorDotProps { color: string }
const ColorDot: React.FC<ColorDotProps> = ({ color }) => (
  <Box sx={{ width: 14, height: 14, borderRadius: '50%', background: color || '#ccc', border: '1px solid', borderColor: 'divider', flexShrink: 0 }} />
);

interface Props {
  input: PrintCalculationInput;
  onChange: (input: PrintCalculationInput) => void;
  spools: SpoolProfile[];
  printers: PrinterProfile[];
  errors: Record<string, string>;
}

const CalculatorForm: React.FC<Props> = ({ input, onChange, spools, printers, errors }) => {
  const set = <K extends keyof PrintCalculationInput>(key: K, value: PrintCalculationInput[K]) => {
    onChange({ ...input, [key]: value });
  };

  // Эффективный вес для расчёта обработки: если введён вес модели — используем его, иначе общий вес
  const effectiveModelWeight = (w: number) =>
    input.modelWeight > 0 ? input.modelWeight : (input.partWeight > 0 ? input.partWeight : w);

  // При изменении веса — пересчитываем per_gram этапы обработки (только включённые)
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

  const handleSpoolSelect = (id: string) => {
    const spool = spools.find((s) => s.id === id);
    if (!spool) {
      onChange({ ...input, spoolProfileId: undefined });
      return;
    }
    onChange({
      ...input,
      spoolProfileId: spool.id,
      spoolPrice: spool.price,
      spoolWeight: spool.weight,
    });
  };

  const handlePrinterSelect = (id: string) => {
    const printer = printers.find((p) => p.id === id);
    if (!printer) {
      onChange({ ...input, printerProfileId: undefined });
      return;
    }
    onChange({
      ...input,
      printerProfileId: printer.id,
      powerWatts: printer.powerWatts,
      printerCost: printer.printerCost,
      printerLifeHours: printer.lifeHours,
    });
  };

  // При включении/выключении этапа обработки — авто-заполняем стоимость для per_gram
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
    onChange({
      ...input,
      processing: {
        ...input.processing,
        items: input.processing.items.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      },
    });
  };

  const selectedSpool = spools.find((s) => s.id === input.spoolProfileId);
  const selectedPrinter = printers.find((p) => p.id === input.printerProfileId);
  const gramCost =
    input.spoolWeight > 0 && input.spoolPrice > 0
      ? input.spoolPrice / input.spoolWeight
      : 0;

  return (
    <Stack spacing={2.5}>
      {/* === Основные параметры === */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
            Основные параметры
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Название детали"
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
                  label="Общий расход филамента"
                  type="number"
                  value={input.partWeight || ''}
                  onChange={(e) => handleWeightChange('partWeight', parseFloat(e.target.value) || 0)}
                  error={!!errors.partWeight}
                  helperText={errors.partWeight || 'Включая поддержки и юбку'}
                  inputProps={{ min: 0, step: 0.1 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>г</Box> }}
                  fullWidth
                  size="small"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Вес модели"
                  type="number"
                  value={input.modelWeight || ''}
                  onChange={(e) => handleWeightChange('modelWeight', parseFloat(e.target.value) || 0)}
                  helperText="Только модель, без поддержек"
                  inputProps={{ min: 0, step: 0.1 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>г</Box> }}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Количество деталей"
                  type="number"
                  value={input.quantity}
                  onChange={(e) => set('quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  inputProps={{ min: 1, step: 1 }}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Время печати */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Время печати
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Часы"
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
                    label="Минуты"
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
              Сложность модели
            </FormLabel>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
              Коэффициент сложности учитывает сложность геометрии, количество поддержек и риск брака.
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
                                <Typography variant="body2" fontWeight={selected ? 700 : 400}>
                                  {opt.label}
                                </Typography>
                                <Typography variant="caption" color="primary.main" fontWeight={600}>
                                  ×{opt.value}
                                </Typography>
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {opt.description}
                              </Typography>
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
            Материал
          </Typography>
          <Stack spacing={2}>
            {spools.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Профиль катушки</InputLabel>
                <Select
                  value={input.spoolProfileId || ''}
                  label="Профиль катушки"
                  onChange={(e) => handleSpoolSelect(e.target.value)}
                  renderValue={(v) => {
                    const s = spools.find((x) => x.id === v);
                    if (!s) return 'Не выбран';
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
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <ColorDot color={selectedSpool.color} />
                    <Typography variant="caption">{selectedSpool.color}</Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">Тип: <strong>{selectedSpool.plasticType}</strong></Typography>
                  <Typography variant="caption" color="text.secondary">Цена 1 г: <strong>{gramCost.toFixed(2)} ₽</strong></Typography>
                </Stack>
              </Paper>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Цена катушки"
                  type="number"
                  value={input.spoolPrice || ''}
                  onChange={(e) => set('spoolPrice', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 10 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
                  helperText={selectedSpool ? 'Из профиля — можно изменить вручную' : undefined}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Вес катушки"
                  type="number"
                  value={input.spoolWeight}
                  onChange={(e) => set('spoolWeight', parseFloat(e.target.value) || 1000)}
                  inputProps={{ min: 1, step: 50 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>г</Box> }}
                  helperText={selectedSpool ? 'Из профиля — можно изменить вручную' : 'По умолчанию 1000 г'}
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
            Принтер и электроэнергия
          </Typography>
          <Stack spacing={2}>
            {printers.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel>Профиль принтера</InputLabel>
                <Select
                  value={input.printerProfileId || ''}
                  label="Профиль принтера"
                  onChange={(e) => handlePrinterSelect(e.target.value)}
                >
                  <MenuItem value=""><em>Не выбран</em></MenuItem>
                  {printers.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} · {p.powerWatts} Вт
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Мощность принтера"
                  type="number"
                  value={input.powerWatts}
                  onChange={(e) => set('powerWatts', parseFloat(e.target.value) || 220)}
                  inputProps={{ min: 1, step: 10 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>Вт</Box> }}
                  helperText={selectedPrinter ? 'Из профиля — можно изменить' : 'По умолчанию 220 Вт'}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Стоимость эл-энергии"
                  type="number"
                  value={input.electricityCostPerKwh}
                  onChange={(e) => set('electricityCostPerKwh', parseFloat(e.target.value) || 6)}
                  inputProps={{ min: 0, step: 0.1 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽/кВт⋅ч</Box> }}
                  helperText="По умолчанию 6 ₽/кВт⋅ч"
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Стоимость принтера"
                  type="number"
                  value={input.printerCost}
                  onChange={(e) => set('printerCost', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: 1000 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
                  helperText={selectedPrinter ? 'Из профиля — можно изменить' : undefined}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Срок службы"
                  type="number"
                  value={input.printerLifeHours}
                  onChange={(e) => set('printerLifeHours', parseFloat(e.target.value) || 3000)}
                  inputProps={{ min: 1, step: 100 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>ч</Box> }}
                  helperText={selectedPrinter ? 'Из профиля — можно изменить' : 'По умолчанию 3000 ч'}
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
                onChange={(e) =>
                  onChange({ ...input, processing: { ...input.processing, enabled: e.target.checked } })
                }
              />
            }
            label={<Typography variant="subtitle1" fontWeight={600} color="primary">Обработка</Typography>}
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
                      <Grid size={{ xs: 12, sm: 5 }}>
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
                                sx={{ width: 160 }}
                              />
                            ) : (
                              <Stack>
                                <Typography variant="body2">{item.name}</Typography>
                                {rateHint && (
                                  <Typography variant="caption" color="text.secondary">
                                    {rateHint}
                                  </Typography>
                                )}
                              </Stack>
                            )
                          }
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 7 }}>
                        {item.enabled && (
                          <TextField
                            label="Стоимость"
                            type="number"
                            value={item.cost || ''}
                            onChange={(e) => updateProcessingItem(item.id, { cost: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: item.costMode === 'per_gram' ? 0.1 : 10 }}
                            InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
                            helperText={item.costMode === 'per_gram' && autoComputedCost !== null ? 'Авто · можно изменить' : undefined}
                            size="small"
                            fullWidth
                          />
                        )}
                      </Grid>
                    </Grid>
                    <Divider sx={{ mt: 1 }} />
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* === Дополнительные расходы === */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom color="primary">
            Дополнительные расходы
          </Typography>
          <TextField
            label="Прочие расходы"
            type="number"
            value={input.extraCost || ''}
            onChange={(e) => set('extraCost', parseFloat(e.target.value) || 0)}
            inputProps={{ min: 0, step: 10 }}
            InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
            helperText="Доставка, расходники, аренда — всё что не входит в другие категории"
            fullWidth
            size="small"
          />
        </CardContent>
      </Card>

      {/* === Прибыль === */}
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
            <Typography variant="subtitle1" fontWeight={600} color="primary">
              Прибыль
            </Typography>
            <Tooltip title="Прибыль добавляется к себестоимости для получения итоговой цены">
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <RadioGroup
            row
            value={input.profitMode}
            onChange={(e) => set('profitMode', e.target.value as 'percent' | 'fixed')}
          >
            <FormControlLabel value="percent" control={<Radio size="small" />} label="Процент" />
            <FormControlLabel value="fixed" control={<Radio size="small" />} label="Фиксированная сумма" />
          </RadioGroup>

          <Box sx={{ mt: 1.5 }}>
            {input.profitMode === 'percent' ? (
              <TextField
                label="Процент прибыли"
                type="number"
                value={input.profitValue}
                onChange={(e) => set('profitValue', parseFloat(e.target.value) || 0)}
                inputProps={{ min: 0, step: 1 }}
                InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>%</Box> }}
                helperText="По умолчанию 30%"
                sx={{ width: 200 }}
                size="small"
              />
            ) : (
              <TextField
                label="Фиксированная прибыль"
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
            control={
              <Checkbox
                checked={input.roundingEnabled}
                onChange={(e) => set('roundingEnabled', e.target.checked)}
              />
            }
            label={
              <Stack>
                <Typography variant="subtitle1" fontWeight={600} color="primary">
                  Округление цены
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  До ₽1 (до ₽10, до ₽5 или до ₽50 — автоматически в зависимости от суммы)
                </Typography>
              </Stack>
            }
          />
        </CardContent>
      </Card>
    </Stack>
  );
};

export default CalculatorForm;
