import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import './CustomSelect.css';

export type SelectOption = {
  value: string;
  label: string;
  color?: string;
  icon?: string;
  description?: string;
};

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  id,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`cs__wrap ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''} ${className}`} ref={dropdownRef}>
      <button
        type="button"
        id={id}
        className="cs__trigger"
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        disabled={disabled}
      >
        <div className="cs__selected">
          {selectedOption ? (
            <>
              {selectedOption.color && (
                <span className="cs__dot" style={{ background: selectedOption.color }} />
              )}
              {selectedOption.icon && (
                <span className="cs__icon"><Icon name={selectedOption.icon} size={13} /></span>
              )}
              <span className="cs__label">{selectedOption.label}</span>
            </>
          ) : (
            <span className="cs__placeholder">{placeholder}</span>
          )}
        </div>

        <span className="cs__arrow">
          <Icon name="chevron-down" size={14} />
        </span>
      </button>

      {isOpen && (
        <div className="cs__dropdown">
          <div className="cs__options">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`cs__option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <div className="cs__option-left">
                    {opt.color && (
                      <span className="cs__dot" style={{ background: opt.color }} />
                    )}
                    {opt.icon && (
                      <span className="cs__icon"><Icon name={opt.icon} size={13} /></span>
                    )}
                    <div className="cs__option-text">
                      <span className="cs__option-label">{opt.label}</span>
                      {opt.description && (
                        <span className="cs__option-desc">{opt.description}</span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <span className="cs__check">
                      <Icon name="check" size={13} strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
