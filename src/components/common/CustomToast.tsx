import React, { useEffect } from 'react';
import Icon from './Icon';
import './CustomToast.css';

export type ToastMessage = {
  id?: string;
  show: boolean;
  msg: string;
  title?: string;
  color?: 'success' | 'danger' | 'warning' | 'info' | string;
  duration?: number;
};

interface CustomToastProps {
  toast: ToastMessage;
  onDismiss: () => void;
}

const CustomToast: React.FC<CustomToastProps> = ({ toast, onDismiss }) => {
  const { show, msg, color = 'success', duration = 3000, title } = toast;

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [show, duration, onDismiss]);

  if (!show) return null;

  const isDeleteAction =
    msg.toLowerCase().includes('delete') ||
    msg.toLowerCase().includes('hapus') ||
    msg.toLowerCase().includes('remove');

  let defaultTitle = 'Sukses';
  if (color === 'danger') {
    defaultTitle = isDeleteAction ? 'Terhapus' : 'Perhatian';
  } else if (color === 'warning') {
    defaultTitle = 'Peringatan';
  } else if (color === 'info') {
    defaultTitle = 'Informasi';
  }

  const displayTitle = title || defaultTitle;
  const displayIcon = color === 'danger' && isDeleteAction ? 'trash' : color === 'danger' ? 'alert' : color === 'warning' ? 'alert' : color === 'info' ? 'board' : 'check';

  const typeMap: Record<string, { bg: string; border: string; bar: string }> = {
    success: {
      bg: '#ECFDF5',
      border: '#A7F3D0',
      bar: '#10B981',
    },
    danger: {
      bg: '#FEF2F2',
      border: '#FCA5A5',
      bar: '#EF4444',
    },
    warning: {
      bg: '#FFFBEB',
      border: '#FDE68A',
      bar: '#F59E0B',
    },
    info: {
      bg: '#EFF6FF',
      border: '#BFDBFE',
      bar: '#3B82F6',
    },
  };

  const style = typeMap[color] || typeMap.success;

  return (
    <div className="ct__container">
      <div className="ct__toast" style={{ background: style.bg, borderColor: style.border }}>
        <div className="ct__badge" style={{ background: style.bar }}>
          <Icon name={displayIcon as any} size={14} strokeWidth={2.5} />
        </div>

        <div className="ct__content">
          <span className="ct__title" style={{ color: style.bar }}>{displayTitle}</span>
          <span className="ct__msg">{msg}</span>
        </div>

        <button type="button" className="ct__close" onClick={onDismiss} title="Dismiss">
          <Icon name="x" size={14} />
        </button>

        <div className="ct__bar-wrap">
          <div
            className="ct__bar-fill"
            style={{ background: style.bar, animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CustomToast;
