import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import type { PrinterProfile } from '../../types';
import ConfirmDialog from '../common/ConfirmDialog';
import { generateId } from '../../utils/storage';

interface PrinterDialogProps {
  open: boolean;
  initial?: PrinterProfile | null;
  onSave: (p: PrinterProfile) => void;
  onClose: () => void;
}

const emptyProfile = (): Omit<PrinterProfile, 'id'> => ({
  name: '',
  powerWatts: 220,
  printerCost: 0,
  lifeHours: 3000,
  note: '',
});

const PrinterDialog: React.FC<PrinterDialogProps> = ({ open, initial, onSave, onClose }) => {
  const [form, setForm] = useState<Omit<PrinterProfile, 'id'>>(
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
    if (!form.name.trim()) errs.name = 'Введите название принтера';
    if (form.powerWatts <= 0) errs.powerWatts = 'Мощность должна быть больше 0';
    if (form.printerCost < 0) errs.printerCost = 'Стоимость не может быть отрицательной';
    if (form.lifeHours <= 0) errs.lifeHours = 'Срок службы должен быть больше 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: initial?.id ?? generateId(),
      ...form,
      powerWatts: Number(form.powerWatts),
      printerCost: Number(form.printerCost),
      lifeHours: Number(form.lifeHours),
    });
  };

  const wearPerHour =
    form.printerCost > 0 && form.lifeHours > 0
      ? (form.printerCost / form.lifeHours).toFixed(2)
      : '0.00';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? 'Редактировать принтер' : 'Новый принтер'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Название принтера"
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
              <TextField
                label="Потребляемая мощность"
                type="number"
                value={form.powerWatts}
                onChange={(e) => set('powerWatts', parseFloat(e.target.value) || 0)}
                error={!!errors.powerWatts}
                helperText={errors.powerWatts}
                inputProps={{ min: 1, step: 1 }}
                InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>Вт</Box> }}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Стоимость принтера"
                type="number"
                value={form.printerCost}
                onChange={(e) => set('printerCost', parseFloat(e.target.value) || 0)}
                error={!!errors.printerCost}
                helperText={errors.printerCost}
                inputProps={{ min: 0, step: 100 }}
                InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>₽</Box> }}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
          <TextField
            label="Срок службы"
            type="number"
            value={form.lifeHours}
            onChange={(e) => set('lifeHours', parseFloat(e.target.value) || 0)}
            error={!!errors.lifeHours}
            helperText={errors.lifeHours || 'По умолчанию 3000 часов'}
            inputProps={{ min: 1, step: 100 }}
            InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>часов</Box> }}
            fullWidth
            size="small"
          />
          {form.printerCost > 0 && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Износ за 1 час печати:{' '}
                <strong>{wearPerHour} ₽</strong>
              </Typography>
            </Box>
          )}
          <TextField
            label="Примечание (необязательно)"
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
        <Button onClick={onClose} variant="outlined">Отмена</Button>
        <Button onClick={handleSave} variant="contained">Сохранить</Button>
      </DialogActions>
    </Dialog>
  );
};

interface Props {
  printers: PrinterProfile[];
  onUpdate: (printers: PrinterProfile[]) => void;
}

const PrinterProfilesManager: React.FC<Props> = ({ printers, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PrinterProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PrinterProfile | null>(null);

  const handleSave = (profile: PrinterProfile) => {
    const existing = printers.find((p) => p.id === profile.id);
    if (existing) {
      onUpdate(printers.map((p) => (p.id === profile.id ? profile : p)));
    } else {
      onUpdate([...printers, profile]);
    }
    setDialogOpen(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    onUpdate(printers.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const openNew = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Принтеры</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Добавить
        </Button>
      </Stack>

      {printers.length === 0 ? (
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
            Профили принтеров отсутствуют
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={openNew}>
            Добавить первый принтер
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {printers.map((printer) => {
            const wearPerHour =
              printer.printerCost > 0 && printer.lifeHours > 0
                ? printer.printerCost / printer.lifeHours
                : 0;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={printer.id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                        <PrintIcon fontSize="small" color="primary" />
                        <Typography fontWeight={600} noWrap title={printer.name}>
                          {printer.name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Редактировать">
                          <IconButton size="small" onClick={() => { setEditTarget(printer); setDialogOpen(true); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(printer)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Мощность</Typography>
                        <Typography variant="body2">{printer.powerWatts} Вт</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Стоимость</Typography>
                        <Typography variant="body2">{printer.printerCost.toLocaleString('ru-RU')} ₽</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Срок службы</Typography>
                        <Typography variant="body2">{printer.lifeHours.toLocaleString('ru-RU')} ч</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Износ / час</Typography>
                        <Typography variant="body2" color="warning.main" fontWeight={600}>
                          {wearPerHour.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
                        </Typography>
                      </Stack>
                      {printer.note && (
                        <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
                          {printer.note}
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

      <PrinterDialog
        open={dialogOpen}
        initial={editTarget}
        onSave={handleSave}
        onClose={() => { setDialogOpen(false); setEditTarget(null); }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Удалить принтер?"
        message={`Профиль «${deleteTarget?.name}» будет удалён без возможности восстановления.`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </Box>
  );
};

export default PrinterProfilesManager;
