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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import type { AppSettings, SpoolProfile, PrinterProfile, SavedCalculation, Project, ProfitEntry, WarehouseItem } from '../../types';
import { DEFAULT_SETTINGS } from '../../utils/defaults';
import { exportAllData, parseBackup, type BackupData } from '../../utils/storage';
import { useTranslation } from '../../i18n/useTranslation';

interface Props {
  settings: AppSettings;
  spools: SpoolProfile[];
  printers: PrinterProfile[];
  history: SavedCalculation[];
  projects: Project[];
  profitEntries?: ProfitEntry[];
  warehouse?: WarehouseItem[];
  onUpdate: (settings: AppSettings) => void;
  onImport: (data: BackupData) => void;
}

const SettingsPanel: React.FC<Props> = ({ settings, spools, printers, history, projects, profitEntries, warehouse, onUpdate, onImport }) => {
  const { t } = useTranslation();
  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [importInfo, setImportInfo] = useState('');

  const handleExport = () => {
    exportAllData(spools, printers, history, projects, settings, profitEntries ?? [], warehouse ?? []);
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
        setImportInfo(t.settings_import_error);
      } else {
        onImport(data);
        setImportStatus('ok');
        setImportInfo(
          `${t.settings_loaded_prefix} ${data.spools.length} ${t.settings_spools_n}, ${data.printers.length} ${t.settings_printers_n}, ${data.projects?.length ?? 0} ${t.settings_projects_n}, ${data.history.length} ${t.settings_history_n}`
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
        <Typography variant="h6">{t.settings_title}</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
        >
          {t.settings_reset}
        </Button>
      </Stack>

      <Stack spacing={2}>
        {/* Внешний вид */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              {t.settings_appearance}
            </Typography>
            <Stack spacing={1.5}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.colorMode === 'dark'}
                    onChange={(e) => set('colorMode', e.target.checked ? 'dark' : 'light')}
                  />
                }
                label={t.settings_dark_theme}
              />
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2">Язык / Language</Typography>
                <ToggleButtonGroup
                  value={settings.language ?? 'ru'}
                  exclusive
                  onChange={(_, v) => { if (v) set('language', v); }}
                  size="small"
                >
                  <ToggleButton value="ru">Русский</ToggleButton>
                  <ToggleButton value="en">English</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Умолчания для электроэнергии */}
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
              <Typography variant="subtitle1" fontWeight={600} color="primary">
                {t.settings_electricity}
              </Typography>
              <Tooltip title={t.settings_elec_tooltip}>
                <InfoOutlinedIcon fontSize="small" color="action" />
              </Tooltip>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t.settings_electricity_cost}
                  type="number"
                  value={settings.defaultElectricityCost}
                  onChange={(e) => set('defaultElectricityCost', parseFloat(e.target.value) || 6)}
                  inputProps={{ min: 0, step: 0.1 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>₽</Box> }}
                  helperText={`${t.common_default_label}: 6 ₽`}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t.settings_power}
                  type="number"
                  value={settings.defaultPowerWatts}
                  onChange={(e) => set('defaultPowerWatts', parseFloat(e.target.value) || 220)}
                  inputProps={{ min: 1, step: 10 }}
                  InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>{t.common_watts}</Box> }}
                  helperText={`${t.common_default_label}: 220 ${t.common_watts}`}
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
              {t.settings_printer_defaults}
            </Typography>
            <TextField
              label={t.settings_printer_life}
              type="number"
              value={settings.defaultPrinterLifeHours}
              onChange={(e) => set('defaultPrinterLifeHours', parseFloat(e.target.value) || 3000)}
              inputProps={{ min: 1, step: 100 }}
              InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>{t.common_hours}</Box> }}
              helperText={`${t.common_default_label}: 3000 ${t.common_hour_short}`}
              sx={{ width: 260 }}
              size="small"
            />
          </CardContent>
        </Card>

        {/* Прибыль */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
              {t.settings_profit_default}
            </Typography>
            <TextField
              label={t.settings_profit_percent}
              type="number"
              value={settings.defaultProfitPercent}
              onChange={(e) => set('defaultProfitPercent', parseFloat(e.target.value) || 30)}
              inputProps={{ min: 0, step: 1 }}
              InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.85em' }}>%</Box> }}
              helperText={`${t.common_default_label}: 30%`}
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
              {t.settings_backup}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t.settings_backup_desc}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleExport}
              >
                {t.settings_export}
              </Button>
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                {t.settings_import}
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
                {t.settings_import_ok} {importInfo}
              </Alert>
            )}
            {importStatus === 'error' && (
              <Alert severity="error" sx={{ mt: 1.5 }} onClose={() => setImportStatus('idle')}>
                {importInfo}
              </Alert>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
              {t.settings_backup_tip}
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.secondary">
          {t.settings_data_local}
        </Typography>
      </Stack>
    </Box>
  );
};

export default SettingsPanel;
