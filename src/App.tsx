import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { getTheme } from './theme';
import type { AppSettings, PrintCalculationInput, Project, SavedCalculation, SpoolProfile, PrinterProfile } from './types';
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
  loadProjects,
  loadSettings,
  loadSpools,
  loadDraft,
  saveDraft,
  clearDraft,
  saveHistory,
  savePrinters,
  saveProjects,
  saveSettings,
  saveSpools,
} from './utils/storage';
import { makeDefaultInput } from './utils/defaults';

// ─── Save-to-project dialog ───────────────────────────────────────────────────
interface SaveDialogProps {
  open: boolean;
  projects: Project[];
  onSave: (projectIds: string[]) => void;
  onClose: () => void;
  onCreateProject: (name: string) => Project;
}

const SaveToProjectDialog: React.FC<SaveDialogProps> = ({
  open,
  projects,
  onSave,
  onClose,
  onCreateProject,
}) => {
  const [selected, setSelected] = React.useState<string[]>([]);
  const [newName, setNewName] = React.useState('');

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const handleAddProject = () => {
    if (newName.trim()) {
      const p = onCreateProject(newName.trim());
      setSelected((prev) => [...prev, p.id]);
      setNewName('');
    }
  };

  const handleSave = () => {
    onSave(selected);
    setSelected([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Сохранить расчёт</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Выберите один или несколько проектов
        </Typography>
        {projects.length > 0 ? (
          <Stack spacing={0}>
            {projects.map((p) => (
              <FormControlLabel
                key={p.id}
                control={
                  <Checkbox
                    size="small"
                    checked={selected.includes(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                }
                label={p.name}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Проектов пока нет
          </Typography>
        )}
        <Divider sx={{ my: 1.5 }}>новый проект</Divider>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="Название"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddProject(); }}
            fullWidth
          />
          <Button variant="outlined" disabled={!newName.trim()} onClick={handleAddProject}>
            Создать
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSave}>
          {selected.length === 0 ? 'Без проекта' : `Сохранить (${selected.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── App ─────────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [spools, setSpools] = useState<SpoolProfile[]>(() => loadSpools());
  const [printers, setPrinters] = useState<PrinterProfile[]>(() => loadPrinters());
  const [history, setHistory] = useState<SavedCalculation[]>(() => loadHistory());
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [activeTab, setActiveTab] = useState<AppTab>('calculator');
  const [input, setInput] = useState<PrintCalculationInput>(() => {
    const draft = loadDraft();
    const initial = draft ?? makeDefaultInput(loadSettings());
    // Авто-выбор единственного принтера
    const savedPrinters = loadPrinters();
    if (savedPrinters.length === 1 && !initial.printerProfileId) {
      const p = savedPrinters[0];
      return { ...initial, printerProfileId: p.id, powerWatts: p.powerWatts, printerCost: p.printerCost, printerLifeHours: p.lifeHours };
    }
    return initial;
  });
  const [draftSnackbarVisible, setDraftSnackbarVisible] = useState<boolean>(() => loadDraft() !== null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [confirmClearForm, setConfirmClearForm] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => { saveSettings(settings); }, [settings]);
  useEffect(() => { saveSpools(spools); }, [spools]);
  useEffect(() => { savePrinters(printers); }, [printers]);
  useEffect(() => { saveHistory(history); }, [history]);
  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { saveDraft(input); }, [input]);

  const result = useMemo(() => calculate(input), [input]);

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (input.partWeight <= 0) errs.partWeight = 'Введите вес детали';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const doSaveCalculation = useCallback((projectIds: string[]) => {
    const selectedSpool = spools.find((s) => s.id === input.spoolProfileId);
    const selectedPrinter = printers.find((p) => p.id === input.printerProfileId);
    const calc: SavedCalculation = {
      id: generateId(),
      savedAt: new Date().toISOString(),
      projectIds: projectIds.length > 0 ? projectIds : undefined,
      input: { ...input },
      result: { ...result },
      spoolName: selectedSpool?.name,
      printerName: selectedPrinter?.name,
    };
    setHistory((prev) => [calc, ...prev]);
    clearDraft();
    setSaveDialogOpen(false);
    const names = projectIds.map((id) => projects.find((p) => p.id === id)?.name).filter(Boolean);
    const label = names.length > 0 ? `в проекты: ${names.join(', ')}` : 'без проекта';
    setSnackbar({ open: true, message: `Расчёт сохранён ${label}`, severity: 'success' });
  }, [input, result, spools, printers, projects]);

  const handleSaveCalculation = () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: 'Исправьте ошибки в форме', severity: 'error' });
      return;
    }
    setSaveDialogOpen(true);
  };

  const handleLoadFromHistory = useCallback((item: SavedCalculation) => {
    setInput({ ...item.input });
    setActiveTab('calculator');
    setSnackbar({ open: true, message: `Загружен расчёт «${item.input.partName || 'Без названия'}»`, severity: 'success' });
  }, []);

  const handleUpdateProject = useCallback((id: string, changes: Partial<import('./types').Project>) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, ...changes } : p));
  }, []);

  const handleDeleteFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const handleCreateProject = useCallback((name: string): Project => {
    const p: Project = { id: generateId(), name, createdAt: new Date().toISOString() };
    setProjects((prev) => [...prev, p]);
    return p;
  }, []);

  const handleDeleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setHistory((prev) =>
      prev.map((h) => {
        const ids = (h.projectIds ?? []).filter((pid) => pid !== id);
        return { ...h, projectIds: ids.length > 0 ? ids : undefined };
      })
    );
  }, []);

  const handleRenameProject = useCallback((id: string, name: string) => {
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, name } : p));
  }, []);

  const handleSetProjectIds = useCallback((calcId: string, projectIds: string[]) => {
    setHistory((prev) =>
      prev.map((h) => h.id === calcId
        ? { ...h, projectIds: projectIds.length > 0 ? projectIds : undefined }
        : h
      )
    );
  }, []);

  const handleImportBackup = useCallback((data: import('./utils/storage').BackupData) => {
    setSpools(data.spools);
    setPrinters(data.printers);
    setHistory(data.history);
    setProjects(data.projects ?? []);
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
                onClear={() => setConfirmClearForm(true)}
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
              projects={projects}
              onLoad={handleLoadFromHistory}
              onDelete={handleDeleteFromHistory}
              onClearAll={() => setHistory([])}
              onCreateProject={handleCreateProject}
              onDeleteProject={handleDeleteProject}
              onRenameProject={handleRenameProject}
              onSetProjectIds={handleSetProjectIds}
              onUpdateProject={handleUpdateProject}
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
                projects={projects}
                onUpdate={setSettings}
                onImport={handleImportBackup}
              />
          </Paper>
        )}
      </Layout>

      <Snackbar
        open={draftSnackbarVisible}
        autoHideDuration={4000}
        onClose={() => setDraftSnackbarVisible(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled" onClose={() => setDraftSnackbarVisible(false)}>
          Черновик восстановлен — продолжайте заполнение
        </Alert>
      </Snackbar>

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

      <SaveToProjectDialog
        open={saveDialogOpen}
        projects={projects}
        onSave={doSaveCalculation}
        onClose={() => setSaveDialogOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <Dialog open={confirmClearForm} onClose={() => setConfirmClearForm(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Очистить форму?</DialogTitle>
        <DialogContent>
          <Typography sx={{ pt: 1 }}>Все введённые значения будут сброшены к значениям по умолчанию.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClearForm(false)}>Отмена</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setInput(makeDefaultInput(loadSettings()));
              clearDraft();
              setFormErrors({});
              setConfirmClearForm(false);
            }}
          >
            Очистить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  </ThemeProvider>
  );
};

export default App;
