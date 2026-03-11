import React, { useState } from 'react';
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
import type { SpoolProfile, PlasticType } from '../../types';
import ConfirmDialog from '../common/ConfirmDialog';
import { generateId } from '../../utils/storage';

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
    if (!form.name.trim()) errs.name = 'Введите название катушки';
    if (form.price < 0) errs.price = 'Цена не может быть отрицательной';
    if (form.weight <= 0) errs.weight = 'Вес должен быть больше 0';
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
      <DialogTitle>{initial ? 'Редактировать катушку' : 'Новая катушка'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Название"
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
                <InputLabel>Тип пластика</InputLabel>
                <Select
                  value={form.plasticType}
                  label="Тип пластика"
                  onChange={(e) => set('plasticType', e.target.value as PlasticType)}
                >
                  {PLASTIC_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  Цвет
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
                label="Цена катушки"
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
                label="Вес катушки"
                type="number"
                value={form.weight}
                onChange={(e) => set('weight', parseFloat(e.target.value) || 0)}
                error={!!errors.weight}
                helperText={errors.weight || 'По умолчанию 1000 г'}
                inputProps={{ min: 1, step: 1 }}
                InputProps={{ endAdornment: <Box component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>г</Box> }}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
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
  spools: SpoolProfile[];
  onUpdate: (spools: SpoolProfile[]) => void;
}

const SpoolProfilesManager: React.FC<Props> = ({ spools, onUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SpoolProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SpoolProfile | null>(null);

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
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">Катушки с пластиком</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>
          Добавить
        </Button>
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
            Профили катушек отсутствуют
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={openNew}>
            Добавить первую катушку
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
                        <Tooltip title="Редактировать">
                          <IconButton size="small" onClick={() => openEdit(spool)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Удалить">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(spool)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    <Stack spacing={0.5}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Тип</Typography>
                        <Chip label={spool.plasticType} size="small" />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Цена</Typography>
                        <Typography variant="body2" fontWeight={500}>{spool.price.toLocaleString('ru-RU')} ₽</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Вес</Typography>
                        <Typography variant="body2">{spool.weight} г</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Цена за 1 г</Typography>
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
        title="Удалить катушку?"
        message={`Профиль «${deleteTarget?.name}» будет удалён без возможности восстановления.`}
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </Box>
  );
};

export default SpoolProfilesManager;
