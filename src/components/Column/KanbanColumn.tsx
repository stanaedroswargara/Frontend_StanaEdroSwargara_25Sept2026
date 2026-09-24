import React, { useState } from 'react';
import type { Column, Task } from '../../store/types';
import { useTaskStore } from '../../store/useTaskStore';
import TaskCard from '../TaskCard/TaskCard';
import Icon from '../common/Icon';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import './KanbanColumn.css';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, onTaskClick, onAddTask, onDeleteColumn }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const { updateColumn } = useTaskStore();

  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const saveTitle = () => {
    if (editTitle.trim()) updateColumn(column.id, editTitle.trim());
    else setEditTitle(column.title);
    setEditing(false);
  };

  return (
    <div className={`col ${isOver ? 'col--over' : ''}`}>
      {/* Header */}
      <div className="col__header" style={{ borderTopColor: column.color }}>
        <div className="col__title-area">
          {editing ? (
            <input
              className="col__title-edit"
              value={editTitle}
              autoFocus
              onChange={e => setEditTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') { setEditTitle(column.title); setEditing(false); } }}
            />
          ) : (
            <div className="col__title-row" onDoubleClick={() => setEditing(true)}>
              <span className="col__title">{column.title}</span>
              <span className="col__count">{tasks.length}</span>
            </div>
          )}
        </div>

        <div className="col__actions">
          <button
            className="col__btn"
            onClick={() => onAddTask(column.id)}
            title="Add task"
            id={`btn-add-task-${column.id}`}
          >
            <Icon name="plus" size={15} strokeWidth={2.5} />
          </button>
          <div className="col__menu-wrap">
            <button
              className="col__btn"
              onClick={() => setMenuOpen(o => !o)}
              title="Column options"
              id={`btn-col-menu-${column.id}`}
            >
              <Icon name="dots" size={15} />
            </button>
            {menuOpen && (
              <>
                <div className="col__menu-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="col__menu">
                  <button onClick={() => { setEditing(true); setMenuOpen(false); }}>
                    <Icon name="edit" size={13} /> Rename Column
                  </button>
                  <button onClick={() => { onAddTask(column.id); setMenuOpen(false); }}>
                    <Icon name="plus" size={13} /> Add Task
                  </button>
                  <div className="col__menu-divider" />
                  <button
                    className="danger"
                    onClick={() => { onDeleteColumn(column.id); setMenuOpen(false); }}
                  >
                    <Icon name="trash" size={13} /> Delete Column
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Task list */}
      <div
        ref={setNodeRef}
        className={`col__list ${tasks.length === 0 ? 'col__list--empty' : ''}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="col__empty">
            <div className="col__empty-icon">
              <Icon name="list" size={28} strokeWidth={1.5} />
            </div>
            <p>No tasks yet</p>
            <button onClick={() => onAddTask(column.id)} id={`btn-empty-add-${column.id}`}>
              <Icon name="plus" size={13} /> Add a task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
