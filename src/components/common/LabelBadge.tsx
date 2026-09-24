import React from 'react';
import type { LabelType } from '../../store/types';
import { LABEL_COLORS } from '../../data/seedData';
import './LabelBadge.css';

interface LabelBadgeProps {
  label: LabelType;
  size?: 'sm' | 'md';
}

const LabelBadge: React.FC<LabelBadgeProps> = ({ label, size = 'sm' }) => {
  const colors = LABEL_COLORS[label];
  return (
    <span
      className={`label-badge label-badge-${size}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderLeft: `3px solid ${colors.border}`,
      }}
    >
      {label}
    </span>
  );
};

export default LabelBadge;
