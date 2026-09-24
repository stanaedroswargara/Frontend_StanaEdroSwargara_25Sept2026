import React, { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { IonPage, IonContent, IonToast } from '@ionic/react';
import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../store/types';
import BoardHeader from '../components/Board/BoardHeader';
import KanbanColumn from '../components/Column/KanbanColumn';
import TaskCard from '../components/TaskCard/TaskCard';
import TaskModal from '../components/TaskModal/TaskModal';
import EmployeeModal from '../components/EmployeeModal/EmployeeModal';
import CustomToast from '../components/common/CustomToast';
import Icon from '../components/common/Icon';
import './BoardPage.css';

const BoardPage: React.FC = () => {
  const { columns, tasks, getFilteredTasks, moveTask, reorderTask, addColumn, deleteColumn } = useTaskStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [defaultColId, setDefaultColId] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<{ show: boolean; msg: string; color?: string; title?: string }>({ show: false, msg: '', color: 'success' });
  const [addColOpen, setAddColOpen] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  const showToast = (msg: string, color = 'success', title?: string) =>
    setToast({ show: true, msg, color, title });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const openTask = (task: Task) => { setSelectedTask(task); setModalOpen(true); };
  const openNew  = (colId: string) => { setSelectedTask(null); setDefaultColId(colId); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setSelectedTask(null); };

  const handleAddColumn = () => {
    if (!newColTitle.trim()) return;
    addColumn(newColTitle.trim());
    showToast(`Column "${newColTitle.trim()}" added`);
    setNewColTitle('');
    setAddColOpen(false);
  };

  const handleDeleteColumn = (colId: string) => {
    const col = columns.find(c => c.id === colId);
    if (!col) return;
    if (!window.confirm(`Delete column "${col.title}" and all its tasks?`)) return;
    deleteColumn(colId);
    showToast('Column deleted', 'danger');
  };

  /* ── DnD ── */
  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveTask(tasks.find(t => t.id === active.id) ?? null);
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const aId = active.id as string;
    const oId = over.id as string;
    const aTask = tasks.find(t => t.id === aId);
    if (!aTask) return;
    if (columns.find(c => c.id === oId) && aTask.columnId !== oId) {
      moveTask(aId, oId); return;
    }
    const oTask = tasks.find(t => t.id === oId);
    if (oTask && aTask.columnId !== oTask.columnId) moveTask(aId, oTask.columnId);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;
    const aTask = tasks.find(t => t.id === active.id);
    const oTask = tasks.find(t => t.id === over.id);
    if (aTask && oTask && aTask.columnId === oTask.columnId)
      reorderTask(aTask.columnId, active.id as string, over.id as string);
  };

  const sorted = [...columns].sort((a, b) => a.position - b.position);

  return (
    <IonPage>
      <IonContent fullscreen scrollX scrollY={false}>
        <div className="bp">
          <BoardHeader
            onAddColumn={() => setAddColOpen(true)}
            onManageTeam={() => setEmpModalOpen(true)}
          />

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="bp__scroll">
              {sorted.map(col => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={getFilteredTasks(col.id)}
                  onTaskClick={openTask}
                  onAddTask={openNew}
                  onDeleteColumn={handleDeleteColumn}
                />
              ))}

              {/* Add new column */}
              {addColOpen ? (
                <div className="bp__add-col-form">
                  <input
                    className="bp__col-input"
                    placeholder="Column name..."
                    value={newColTitle}
                    autoFocus
                    onChange={e => setNewColTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleAddColumn();
                      if (e.key === 'Escape') { setAddColOpen(false); setNewColTitle(''); }
                    }}
                    id="input-new-column"
                  />
                  <div className="bp__add-col-actions">
                    <button className="bp__col-save" onClick={handleAddColumn} id="btn-save-column">
                      <Icon name="check" size={13} strokeWidth={2.5} /> Add
                    </button>
                    <button
                      className="bp__col-cancel"
                      onClick={() => { setAddColOpen(false); setNewColTitle(''); }}
                      id="btn-cancel-column"
                    >
                      <Icon name="x" size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="bp__add-col"
                  onClick={() => setAddColOpen(true)}
                  id="btn-add-column"
                >
                  <Icon name="plus" size={15} strokeWidth={2.5} />
                  Add new List
                </button>
              )}
            </div>

            <DragOverlay>
              {activeTask && (
                <div className="bp__overlay">
                  <TaskCard task={activeTask} onClick={() => {}} />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>

        <TaskModal
          isOpen={modalOpen}
          task={selectedTask}
          defaultColumnId={defaultColId}
          onClose={closeModal}
          onToast={showToast}
          onManageTeam={() => setEmpModalOpen(true)}
        />

        <EmployeeModal
          isOpen={empModalOpen}
          onClose={() => setEmpModalOpen(false)}
          onToast={showToast}
        />

        <CustomToast
          toast={toast}
          onDismiss={() => setToast(t => ({ ...t, show: false }))}
        />

        <div className="bp__footer-credit">
          <Icon name="code" size={12} />
          <span>Created by <strong>Stana Edro Swargara</strong></span>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BoardPage;
