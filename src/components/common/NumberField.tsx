import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

interface NumberFieldProps {
  label: string;
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  helperText?: string;
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  decimalPlaces?: number;
}

const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  unit,
  helperText,
  error,
  errorText,
  disabled,
  placeholder,
  required,
  fullWidth = true,
  size = 'small',
  decimalPlaces,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '' || raw === '-') {
      onChange('');
      return;
    }
    const num = decimalPlaces !== undefined ? parseFloat(raw) : parseFloat(raw);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  const handleBlur = () => {
    if (value === '') {
      onChange(min);
    }
  };

  return (
    <TextField
      label={label}
      type="number"
      value={value === '' ? '' : value}
      onChange={handleChange}
      onBlur={handleBlur}
      inputProps={{ min, step: step ?? (decimalPlaces ? Math.pow(10, -decimalPlaces) : 1) }}
      InputProps={unit ? { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> } : undefined}
      helperText={error && errorText ? errorText : helperText}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      required={required}
      fullWidth={fullWidth}
      size={size}
    />
  );
};

export default NumberField;
