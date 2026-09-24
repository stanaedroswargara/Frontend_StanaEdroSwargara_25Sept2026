import React from 'react';
import type { Assignee } from '../../store/types';
import './Avatar.css';

interface AvatarProps {
  assignee: Assignee;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ assignee, size = 'sm', showTooltip = true }) => {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className={`avatar avatar-${size}`} title={showTooltip ? assignee.name : undefined}>
      {!imgError ? (
        <img
          src={assignee.avatar}
          alt={assignee.name}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="avatar-initials" style={{ backgroundColor: assignee.color }}>
          {assignee.initials}
        </span>
      )}
    </div>
  );
};

export default Avatar;
