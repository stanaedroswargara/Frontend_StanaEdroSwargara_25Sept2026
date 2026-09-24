import React, { useState } from 'react';
import type { Task } from '../../store/types';
import { useTaskStore } from '../../store/useTaskStore';
import Avatar from '../common/Avatar';
import LabelBadge from '../common/LabelBadge';
import Icon from '../common/Icon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { teamMembers } = useTaskStore();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignees = task.assignees
    .map(id => teamMembers.find(m => m.id === id))
    .filter(Boolean) as typeof teamMembers;

  const total = task.checklist.length;
  const done = task.checklist.filter(c => c.completed).length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    done < total;

  const fmt = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate()} ${dt.toLocaleString('en', { month: 'short' })}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`card ${isDragging ? 'card--drag' : ''}`}
      {...attributes}
      {...listeners}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
    >
      {task.coverImage && (
        <div className="card__cover">
          <img src={task.coverImage} alt="" />
        </div>
      )}

      <div className="card__body">
        <div className="card__label-row">
          <LabelBadge label={task.label} />
          {task.priority && (
            <span className={`card__priority card__priority--${task.priority.toLowerCase()}`}>
              <Icon name="flag" size={10} strokeWidth={2.5} />
              {task.priority}
            </span>
          )}
        </div>

        <p className="card__title">{task.title}</p>

        {total > 0 && (
          <div className="card__progress">
            <div className="card__progress-bar">
              <div className="card__progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="card__footer">
          <div className="card__meta">
            {task.dueDate && (
              <span className={`card__chip ${isOverdue ? 'card__chip--red' : ''}`}>
                <Icon name="calendar" size={11} />
                {fmt(task.dueDate)}
              </span>
            )}
            {total > 0 && (
              <span className={`card__chip ${done === total ? 'card__chip--green' : ''}`}>
                <Icon name="check-square" size={11} />
                {done}/{total}
              </span>
            )}
            {task.attachments.length > 0 && (
              <span className="card__chip">
                <Icon name="paperclip" size={11} />
                {task.attachments.length}
              </span>
            )}
          </div>

          {assignees.length > 0 && (
            <div className="card__avatars">
              {assignees.slice(0, 3).map((a, i) => (
                <div key={a.id} className="card__av-wrap" style={{ zIndex: 3 - i }}>
                  <Avatar assignee={a} size="sm" />
                </div>
              ))}
              {assignees.length > 3 && (
                <div className="card__av-more">+{assignees.length - 3}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
