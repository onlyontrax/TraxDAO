import React, { ReactNode, useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronDown, AlertCircle } from 'lucide-react';

export interface TraxInputFieldProps {
  type: 'text' | 'password' | 'number' | 'select' | 'tel' | 'email' | 'textarea' | 'hidden';
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  optional?: boolean;
  error?: string;
  icon?: ReactNode;
  options?: Array<{ value: string; label: string }>;
  value?: string | number;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function TraxInputField({
  type = 'text',
  name,
  label,
  placeholder,
  disabled,
  required,
  optional,
  error,
  icon,
  options = [],
  value,
  rows,
  onChange,
  onBlur
}: TraxInputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const hasValue = value !== undefined && value !== '' && value !== null;
    setIsDirty(hasValue);
  }, [value]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setIsDirty(!!e.target.value);
    onChange?.(e);
  };

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <div className="select-wrapper">
          <select
            className="trax-input-field"
            disabled={disabled}
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            required={required}
            name={name}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="select-icon" />
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          className="trax-input-field"
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          name={name}
          rows={rows || 4}
        />
      );
    }

    return (
      <input
        type={inputType}
        className="trax-input-field"
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        name={name}
      />
    );
  };

  return (
    <div className="trax-input-container">
      <div className={`trax-input-wrapper
        ${isFocused && !error ? 'active' : ''}
        ${isFocused || isDirty || placeholder ? 'dirty' : ''}
        ${error ? 'error' : ''}
        ${disabled ? 'disabled' : ''}
        ${!isFocused && isDirty && !error ? 'filled' : ''}`}
      >
      {icon && <span className="input-icon">{icon}</span>}
        {renderInput()}
        <label className="input-label">
          {label}
          {optional && <span className="badge-optional">Optional</span>}
          {required && <span className="required-mark">*</span>}
        </label>
        {type === 'password' && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
          </button>
        )}
        {error && (
        <span className="error-icon">
          <AlertCircle className="size-5" />
        </span>
      )}
      </div>
    </div>
  );
}
