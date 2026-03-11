import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { getTheme } from './theme';
import type { AppSettings, PrintCalculationInput, SavedCalculation, SpoolProfile, PrinterProfile } from './types';
import Layout, { type AppTab } from './components/Layout/Layout';
import CalculatorForm from './components/CalculatorForm/CalculatorForm';
import ResultsPanel from './components/ResultsPanel/ResultsPanel';
import BreakdownPanel from './components/BreakdownPanel/BreakdownPanel';
import SpoolProfilesManager from './components/SpoolProfilesManager/SpoolProfilesManager';
import PrinterProfilesManager from './components/PrinterProfilesManager/PrinterProfilesManager';
import HistoryPanel from './components/HistoryPanel/HistoryPanel';
import SettingsPanel from './components/SettingsPanel/SettingsPanel';
import { calculate } from './utils/calculations';
import {
  generateId,
  loadHistory,
  loadPrinters,
  loadSettings,
  loadSpools,
  saveHistory,
  savePrinters,
  saveSettings,
  saveSpools,
} from './utils/storage';
import { makeDefaultInput } from './utils/defaults';

const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [spools, setSpools] = useState<SpoolProfile[]>(() => loadSpools());
  const [printers, setPrinters] = useState<PrinterProfile[]>(() => loadPrinters());
  const [history, setHistory] = useState<SavedCalculation[]>(() => loadHistory());
  const [activeTab, setActiveTab] = useState<AppTab>('calculator');
  const [input, setInput] = useState<PrintCalculationInput>(() => makeDefaultInput(loadSettings()));
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { saveSpools(spools); }, [spools]);
  useEffect(() => { savePrinters(printers); }, [printers]);
  useEffect(() => { saveHistory(history); }, [history]);

  const result = useMemo(() => calculate(input), [input]);

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (input.partWeight <= 0) errs.partWeight = 'Введите вес детали';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveCalculation = () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Исправьте ошибки в форме', severity: 'error' });
      return;
    }
    const selectedSpool = spools.find((s) => s.id === input.spoolProfileId);
    const selectedPrinter = printers.find((p) => p.id === input.printerProfileId);
    const calc: SavedCalculation = {
      id: generateId(),
      savedAt: new Date().toISOString(),
      input: { ...input },
      result: { ...result },
      spoolName: selectedSpool?.name,
      printerName: selectedPrinter?.name,
    };
    setHistory((prev) => [calc, ...prev]);
    setSnackbar({ open: true, message: 'Расчёт сохранён в историю', severity: 'success' });
  };

  const handleLoadFromHistory = useCallback((item: SavedCalculation) => {
    setInput({ ...item.input });
    setActiveTab('calculator');
    setSnackbar({ open: true, message: `Загружен расчёт «${item.input.partName || 'Без названия'}»`, severity: 'success' });
  }, []);

  const handleDeleteFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const handleImportBackup = useCallback((data: import('./utils/storage').BackupData) => {
    setSpools(data.spools);
    setPrinters(data.printers);
    setHistory(data.history);
    if (data.settings) setSettings((prev) => ({ ...prev, ...data.settings }));
    setSnackbar({ open: true, message: 'Данные успешно восстановлены из резервной копии', severity: 'success' });
  }, []);

  const hasResult = input.partWeight > 0 || input.printHours > 0 || input.printMinutes > 0;

  const theme = useMemo(() => getTheme(settings.colorMode), [settings.colorMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <>
        <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        colorMode={settings.colorMode}
        onToggleColorMode={() =>
          setSettings((s) => ({ ...s, colorMode: s.colorMode === 'light' ? 'dark' : 'light' }))
        }
      >
        {activeTab === 'calculator' && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <CalculatorForm
                input={input}
                onChange={(v) => { setInput(v); setFormErrors({}); }}
                spools={spools}
                printers={printers}
                errors={formErrors}
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveCalculation}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Сохранить расчёт в историю
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              {hasResult ? (
                <Stack spacing={2}>
                  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
                    <ResultsPanel
                      result={result}
                      input={input}
                      spools={spools}
                      printers={printers}
                    />
                  </Paper>
                  <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
                    <BreakdownPanel result={result} input={input} />
                  </Paper>
                </Stack>
              ) : (
                <Box
                  sx={{
                    height: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Typography color="text.secondary" variant="h6">Заполните форму расчёта</Typography>
                  <Typography color="text.secondary" variant="body2">
                    Введите вес детали или время печати — результаты появятся здесь
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        )}

        {activeTab === 'spools' && (
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <SpoolProfilesManager spools={spools} onUpdate={setSpools} />
          </Paper>
        )}

        {activeTab === 'printers' && (
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <PrinterProfilesManager printers={printers} onUpdate={setPrinters} />
          </Paper>
        )}

        {activeTab === 'history' && (
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
            <HistoryPanel
              history={history}
              onLoad={handleLoadFromHistory}
              onDelete={handleDeleteFromHistory}
              onClearAll={() => setHistory([])}
            />
          </Paper>
        )}

        {activeTab === 'settings' && (
          <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, maxWidth: 640 }}>
            <SettingsPanel
                settings={settings}
                spools={spools}
                printers={printers}
                history={history}
                onUpdate={setSettings}
                onImport={handleImportBackup}
              />
          </Paper>
        )}
      </Layout>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  </ThemeProvider>
  );
};

export default App;
