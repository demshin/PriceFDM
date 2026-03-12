import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import type { AppSettings, SpoolProfile, PrinterProfile, SavedCalculation, Project } from '../../types';
import { DEFAULT_SETTINGS } from '../../utils/defaults';
import { exportAllData, parseBackup, type BackupData } from '../../utils/storage';

interface Props {
  settings: AppSettings;
  spools: SpoolProfile[];
  printers: PrinterProfile[];
  history: SavedCalculation[];
  projects: Project[];
  onUpdate: (settings: AppSettings) => void;
  onImport: (data: BackupData) => void;
}

const SettingsPanel: React.FC<Props> = ({ settings, spools, printers, history, projects, onUpdate, onImport }) => {
  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [importInfo, setImportInfo] = useState('');

  const handleExport = () => {
    exportAllData(spools, printers, history, projects, settings);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const data = parseBackup(text);
      if (!data) {
        setImportStatus('error');
        setImportInfo('Файл повреждён или неверного формата');
      } else {
        onImport(data);
        setImportStatus('ok');
        setImportInfo(
          `Загружено: ${data.spools.length} катушек, ${data.printers.length} принтеров, ${data.projects?.length ?? 0} проектов, ${data.history.length} записей истории`
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    onUpdate({ ...DEFAULT_SETTINGS, colorMode: settings.colorMode });
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Настройки</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
        >
          Сбросить умолчания
        </Button>
      </Stack>

      <Stack spacing={2}>
        {/* Внешний вид */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Внешний вид
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.colorMode === 'dark'}
                  onChange={(e) => set('colorMode', e.target.checked ? 'dark' : 'light')}
                />
              }
              label="Тёмная тема"
            />
          </CardContent>
        </Card>

        {/* Умолчания для электроэнергии */}
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <Typography variant="subtitle1" fontWeight={600} color="primary">
                Электроэнергия (по умолчанию)
              </Typography>
              <Tooltip title="Эти значения применяются при создании нового расчёта, если не выбран профиль принтера">
                <InfoOutlinedIcon fontSize="small" color="action" />
              </Tooltip>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Стоимость кВт⋅ч"
                  type="number"
                  value={settings.defaultElectricityCost}
                  onChange={(e) => set('defaultElectricityCost', parseFloat(e.target.value) || 6)}
                  inputProps={{ min: 0, step: 0.1 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
                  helperText="По умолчанию: 6 ₽"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Мощность принтера"
                  type="number"
                  value={settings.defaultPowerWatts}
                  onChange={(e) => set('defaultPowerWatts', parseFloat(e.target.value) || 220)}
                  inputProps={{ min: 1, step: 10 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>Вт</Box> }}
                  helperText="По умолчанию: 220 Вт"
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Умолчания для принтера */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Принтер (по умолчанию)
            </Typography>
            <TextField
              label="Срок службы принтера"
              type="number"
              value={settings.defaultPrinterLifeHours}
              onChange={(e) => set('defaultPrinterLifeHours', parseFloat(e.target.value) || 3000)}
              inputProps={{ min: 1, step: 100 }}
              InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>часов</Box> }}
              helperText="По умолчанию: 3000 ч"
              sx={{ width: 260 }}
              size="small"
            />
          </CardContent>
        </Card>

        {/* Прибыль */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Прибыль (по умолчанию)
            </Typography>
            <TextField
              label="Процент прибыли"
              type="number"
              value={settings.defaultProfitPercent}
              onChange={(e) => set('defaultProfitPercent', parseFloat(e.target.value) || 30)}
              inputProps={{ min: 0, step: 1 }}
              InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>%</Box> }}
              helperText="По умолчанию: 30%"
              sx={{ width: 200 }}
              size="small"
            />
          </CardContent>
        </Card>

        <Divider />

        {/* Резервная копия */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              Резервная копия данных
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Экспорт сохраняет все катушки, принтеры, историю расчётов и настройки в один JSON-файл.
              При импорте все текущие данные полностью заменяются данными из файла.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
              >
                Скачать резервную копию
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Загрузить из файла
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Stack>
            {importStatus === 'ok' && (
              <Alert severity="success" sx={{ mt: 1.5 }} onClose={() => setImportStatus('idle')}>
                Данные успешно загружены. {importInfo}
              </Alert>
            )}
            {importStatus === 'error' && (
              <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setImportStatus('idle')}>
                {importInfo}
              </Alert>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              Все данные хранятся локально. Рекомендуем периодически делать резервную копию.
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.secondary">
          Данные хранятся локально на этом компьютере. Сервер не используется.
        </Typography>
      </Stack>
    </Box>
  );
};

export default SettingsPanel;
