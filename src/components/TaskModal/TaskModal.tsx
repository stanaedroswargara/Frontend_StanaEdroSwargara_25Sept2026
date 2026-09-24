import React, { useState, useRef, useEffect } from 'react';
import { IonModal, IonToast } from '@ionic/react';
import type { Task, LabelType, PriorityType, ChecklistItem } from '../../store/types';
import { useTaskStore } from '../../store/useTaskStore';
import { LABEL_COLORS } from '../../data/seedData';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import CustomSelect from '../common/CustomSelect';
import './TaskModal.css';

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null;
  defaultColumnId?: string;
  onClose: () => void;
  onToast?: (msg: string, color: string, title?: string) => void;
  onManageTeam?: () => void;
}

const LABELS: LabelType[] = ['Feature', 'Bug', 'Issue', 'Undefined'];
const PRIORITIES: PriorityType[] = ['Low', 'Medium', 'High', 'Critical'];

type FormErrors = { title?: string };

const genId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, task, defaultColumnId, onClose, onToast, onManageTeam }) => {
  const { columns, updateTask, addTask, deleteTask, teamMembers, boardName, currentUser,
    addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useTaskStore();
  const isNew = !task;

  const blankForm = (): Partial<Task> => ({
    title: '',
    description: '',
    assignees: [],
    dueDate: null,
    columnId: defaultColumnId ?? columns[0]?.id ?? '',
    label: 'Feature',
    priority: null,
    checklist: [],
    attachments: [],
    coverImage: null,
  });

  const [form, setForm] = useState<Partial<Task>>(blankForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [newSubtask, setNewSubtask] = useState('');
  const [marked, setMarked] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setForm({
          title: task.title,
          description: task.description,
          assignees: [...task.assignees],
          dueDate: task.dueDate,
          columnId: task.columnId,
          label: task.label,
          priority: task.priority,
          checklist: task.checklist.map(c => ({ ...c })),
          attachments: task.attachments.map(a => ({ ...a })),
          coverImage: task.coverImage,
        });
        setMarked(task.checklist.length > 0 && task.checklist.every(c => c.completed));
      } else {
        setForm(blankForm());
        setMarked(false);
      }
      setErrors({});
      setNewSubtask('');
      setShowDeleteConfirm(false);
    }
  }, [isOpen, task]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.title?.trim()) errs.title = 'Task title is required';
    setErrors(errs);
    if (errs.title) { setTimeout(() => titleRef.current?.focus(), 100); }
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (isNew) {
      addTask(form.columnId!, {
        title: form.title!.trim(),
        description: form.description ?? '',
        assignees: form.assignees ?? [],
        dueDate: form.dueDate ?? null,
        label: form.label ?? 'Feature',
        priority: form.priority ?? null,
        checklist: form.checklist ?? [],
        attachments: form.attachments ?? [],
        coverImage: form.coverImage ?? null,
      });
      onToast?.('Task berhasil dibuat', 'success', 'Sukses');
    } else if (task) {
      updateTask(task.id, form);
      onToast?.('Task berhasil diperbarui', 'success', 'Sukses');
    }
    onClose();
  };

  const handleDelete = () => {
    if (task) {
      deleteTask(task.id);
      onToast?.('Task berhasil dihapus', 'danger', 'Terhapus');
      onClose();
    }
  };

  const toggleAssignee = (id: string) => {
    setForm(p => {
      const cur = p.assignees ?? [];
      return { ...p, assignees: cur.includes(id) ? cur.filter(a => a !== id) : [...cur, id] };
    });
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    const item: ChecklistItem = { id: genId(), text: newSubtask.trim(), completed: false };
    setForm(p => ({ ...p, checklist: [...(p.checklist ?? []), item] }));
    setNewSubtask('');
    setMarked(false);
  };

  const handleChecklistToggle = (itemId: string) => {
    setForm(p => {
      const updated = (p.checklist ?? []).map(c => c.id === itemId ? { ...c, completed: !c.completed } : c);
      const allDone = updated.length > 0 && updated.every(c => c.completed);
      setMarked(allDone);
      return { ...p, checklist: updated };
    });
  };

  const handleChecklistDelete = (itemId: string) => {
    setForm(p => {
      const updated = (p.checklist ?? []).filter(c => c.id !== itemId);
      const allDone = updated.length > 0 && updated.every(c => c.completed);
      setMarked(allDone);
      return { ...p, checklist: updated };
    });
  };

  const handleToggleMarkComplete = () => {
    const nextMarked = !marked;
    setMarked(nextMarked);
    if ((form.checklist ?? []).length > 0) {
      setForm(p => ({
        ...p,
        checklist: (p.checklist ?? []).map(c => ({ ...c, completed: nextMarked }))
      }));
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newAtts = files.map(f => ({
      id: genId(),
      name: f.name,
      type: f.type.includes('image') ? 'image' as const
        : f.type.includes('pdf') ? 'pdf' as const
        : f.type.includes('sheet') ? 'spreadsheet' as const
        : f.type.includes('doc') ? 'doc' as const : 'other' as const,
      size: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(0)} KB`
        : `${(f.size / 1024 / 1024).toFixed(1)} MB`,
    }));
    setForm(p => ({ ...p, attachments: [...(p.attachments ?? []), ...newAtts] }));
    e.target.value = '';
  };

  const handleCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setForm(p => ({ ...p, coverImage: base64Url }));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const checklist = form.checklist ?? [];
  const checkDone = checklist.filter(c => c.completed).length;
  const checkPct = checklist.length > 0 ? Math.round((checkDone / checklist.length) * 100) : 0;

  const attIconMap: Record<string, React.ReactElement> = {
    pdf: <Icon name="file-pdf" size={18} />,
    doc: <Icon name="file-doc" size={18} />,
    spreadsheet: <Icon name="file-sheet" size={18} />,
    image: <Icon name="file-img" size={18} />,
    other: <Icon name="file-other" size={18} />,
  };

  const PRIORITY_META: Record<string, { color: string; dot: string }> = {
    Low: { color: '#64B5F6', dot: '#64B5F6' },
    Medium: { color: '#FFB74D', dot: '#FFB74D' },
    High: { color: '#EF5350', dot: '#EF5350' },
    Critical: { color: '#9C27B0', dot: '#9C27B0' },
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="task-modal">
      <div className="tm__wrap">

        {/* ── LEFT PANEL ── */}
        <div className="tm__left">

          {/* Top bar */}
          <div className="tm__topbar">
            <button
              className={`tm__complete-btn ${marked ? 'active' : ''}`}
              onClick={handleToggleMarkComplete}
              id="btn-mark-complete"
            >
              <Icon name="check" size={13} strokeWidth={2.5} />
              {marked ? 'Completed' : 'Mark Complete'}
            </button>
            <button className="tm__icon-btn" onClick={onClose} id="btn-close-modal" title="Close">
              <Icon name="x" size={18} />
            </button>
          </div>

          {/* Cover image */}
          <div className="tm__cover-area">
            {form.coverImage ? (
              <div className="tm__cover-img">
                <img src={form.coverImage} alt="cover" />
                <button
                  className="tm__cover-remove"
                  onClick={() => setForm(p => ({ ...p, coverImage: null }))}
                  title="Remove cover"
                >
                  <Icon name="x" size={12} />
                </button>
              </div>
            ) : (
              <button className="tm__cover-add" onClick={() => coverInputRef.current?.click()} id="btn-add-cover">
                <Icon name="image" size={22} />
                <span>Add Cover Image</span>
              </button>
            )}
            <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={handleCoverImage} />
          </div>

          {/* Title */}
          <div className="tm__section">
            <div className={`tm__title-wrap ${errors.title ? 'has-error' : ''}`}>
              <input
                ref={titleRef}
                id="input-task-title"
                className="tm__title-input"
                placeholder="Task title..."
                value={form.title ?? ''}
                onChange={e => { setForm(p => ({ ...p, title: e.target.value })); if (e.target.value.trim()) setErrors(p => ({ ...p, title: undefined })); }}
              />
              <span className="tm__title-edit"><Icon name="edit" size={13} /></span>
            </div>
            {errors.title && (
              <p className="tm__field-error">
                <Icon name="alert" size={12} /> {errors.title}
              </p>
            )}
          </div>

          {/* Assignee + Due Date */}
          <div className="tm__section">
            <div className="tm__grid-2">
              <div className="tm__field">
                <label className="tm__label">
                  <Icon name="user-plus" size={12} /> Assignee
                </label>
                <div className="tm__assignees">
                  {teamMembers.map(m => {
                    const sel = (form.assignees ?? []).includes(m.id);
                    return (
                      <button
                        key={m.id}
                        className={`tm__assignee-btn ${sel ? 'selected' : ''}`}
                        onClick={() => toggleAssignee(m.id)}
                        title={m.name}
                        style={sel ? { outlineColor: m.color } : {}}
                        id={`btn-assignee-${m.id}`}
                      >
                        <Avatar assignee={m} size="md" showTooltip={false} />
                      </button>
                    );
                  })}
                  <button className="tm__add-circle" title="Add / Manage employees" onClick={onManageTeam}>
                    <Icon name="plus" size={14} />
                  </button>
                </div>
              </div>

              <div className="tm__field">
                <label className="tm__label">
                  <Icon name="calendar" size={12} /> Due Date
                </label>
                <input
                  id="input-due-date"
                  type="date"
                  className="tm__input"
                  value={form.dueDate ?? ''}
                  onChange={e => setForm(p => ({ ...p, dueDate: e.target.value || null }))}
                />
              </div>
            </div>
          </div>

          {/* Board + Column */}
          <div className="tm__section">
            <div className="tm__grid-2">
              <div className="tm__field">
                <label className="tm__label">
                  <Icon name="board" size={12} /> Board
                </label>
                <div className="tm__input tm__input--static">
                  <Icon name="lock" size={12} /> {boardName}
                </div>
              </div>
              <div className="tm__field">
                <label className="tm__label">Column</label>
                <CustomSelect
                  id="select-column"
                  options={columns.map(c => ({ value: c.id, label: c.title, color: c.color }))}
                  value={form.columnId ?? ''}
                  onChange={val => setForm(p => ({ ...p, columnId: val }))}
                />
              </div>
            </div>
          </div>

          {/* Label + Priority */}
          <div className="tm__section">
            <div className="tm__grid-2">
              <div className="tm__field">
                <label className="tm__label">
                  <Icon name="flag" size={12} /> Label
                </label>
                <CustomSelect
                  id="select-label"
                  options={LABELS.map(l => ({
                    value: l,
                    label: l,
                    color: l === 'Feature' ? '#4CAF50' : l === 'Bug' ? '#EF5350' : l === 'Issue' ? '#FF9800' : '#9E9E9E',
                  }))}
                  value={form.label ?? 'Feature'}
                  onChange={val => setForm(p => ({ ...p, label: val as LabelType }))}
                />
              </div>
              <div className="tm__field">
                <label className="tm__label">
                  <Icon name="alert" size={12} /> Priority
                </label>
                <CustomSelect
                  id="select-priority"
                  options={[
                    { value: '', label: '— None —' },
                    ...PRIORITIES.map(p => ({
                      value: p,
                      label: p,
                      color: PRIORITY_META[p]?.color,
                    })),
                  ]}
                  value={form.priority ?? ''}
                  onChange={val => setForm(p => ({ ...p, priority: (val as PriorityType) || null }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="tm__right">

          {/* Description */}
          <div className="tm__section">
            <label className="tm__label">
              <Icon name="edit" size={12} /> Description
            </label>
            <textarea
              id="textarea-description"
              className="tm__textarea"
              placeholder="Add a description..."
              value={form.description ?? ''}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Attachments */}
          <div className="tm__section">
            <label className="tm__label">
              <Icon name="paperclip" size={12} /> Attachments
            </label>
            <div
              className="tm__drop-zone"
              onClick={() => fileInputRef.current?.click()}
              id="attachment-dropzone"
            >
              <Icon name="upload" size={16} />
              <span>Drag &amp; Drop files here</span>
              <span className="tm__or">or</span>
              <span className="tm__browse">browse from device</span>
            </div>
            <input ref={fileInputRef} type="file" multiple hidden onChange={handleFiles} />

            {(form.attachments ?? []).length > 0 && (
              <div className="tm__attach-list">
                {(form.attachments ?? []).map(att => (
                  <div key={att.id} className="tm__attach-item">
                    <span className="tm__attach-ico">{attIconMap[att.type] ?? attIconMap.other}</span>
                    <div className="tm__attach-meta">
                      <span className="tm__attach-name">{att.name}</span>
                      <span className="tm__attach-size">{att.size}</span>
                    </div>
                    <button
                      className="tm__attach-del"
                      onClick={() => setForm(p => ({ ...p, attachments: (p.attachments ?? []).filter(a => a.id !== att.id) }))}
                      title="Remove attachment"
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="tm__section">
            <label className="tm__label">
              <Icon name="check-square" size={12} /> Check List
            </label>

            {checklist.length > 0 && (
              <div className="tm__progress-row">
                <span className="tm__progress-label">{checkDone}/{checklist.length}</span>
                <div className="tm__progress-track">
                  <div className="tm__progress-fill" style={{ width: `${checkPct}%` }} />
                </div>
                <span className="tm__progress-pct">{checkPct}%</span>
              </div>
            )}

            <div className="tm__checklist">
              {checklist.map(item => (
                <div key={item.id} className="tm__check-item">
                  <label className="tm__check-label">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleChecklistToggle(item.id)}
                      className="tm__checkbox"
                    />
                    <span className={`tm__check-custom ${item.completed ? 'checked' : ''}`}>
                      {item.completed && <Icon name="check" size={10} strokeWidth={3} />}
                    </span>
                    <span className={`tm__check-text ${item.completed ? 'done' : ''}`}>{item.text}</span>
                  </label>
                  <button className="tm__check-del" onClick={() => handleChecklistDelete(item.id)} title="Remove">
                    <Icon name="x" size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div className="tm__add-subtask">
              <input
                id="input-subtask"
                className="tm__subtask-input"
                placeholder="Add subtask..."
                value={newSubtask}
                onChange={e => setNewSubtask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
              />
              <button className="tm__subtask-btn" onClick={handleAddSubtask} id="btn-add-subtask">
                <Icon name="plus" size={14} />
                Add subtask
              </button>
            </div>
          </div>

          {/* Activity */}
          <div className="tm__section">
            <label className="tm__label">
              <Icon name="activity" size={12} /> Activity
            </label>
            <div className="tm__activity">
              <div className="tm__activity-item">
                <Avatar assignee={(task && task.creator) ? task.creator : currentUser} size="sm" showTooltip={false} />
                <div className="tm__act-body">
                  <strong>{((task && task.creator) ? task.creator : currentUser).name}</strong>
                  <span className="tm__act-action"> {isNew ? 'is creating' : 'last updated'} this task</span>
                  <span className="tm__act-time"> · just now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="tm__footer">
            {!isNew && (
              <>
                {showDeleteConfirm ? (
                  <div className="tm__confirm-delete">
                    <span>Delete this task?</span>
                    <button className="tm__btn tm__btn--danger" onClick={handleDelete} id="btn-confirm-delete">
                      <Icon name="trash" size={13} /> Yes, Delete
                    </button>
                    <button className="tm__btn tm__btn--ghost" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button className="tm__btn tm__btn--danger-outline" onClick={() => setShowDeleteConfirm(true)} id="btn-delete-task">
                    <Icon name="trash" size={13} /> Delete
                  </button>
                )}
              </>
            )}
            <div className="tm__footer-right">
              <button className="tm__btn tm__btn--ghost" onClick={onClose} id="btn-discard">Discard</button>
              <button className="tm__btn tm__btn--primary" onClick={handleSave} id="btn-save-task">
                <Icon name="check" size={13} strokeWidth={2.5} />
                {isNew ? 'Create Task' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default TaskModal;
