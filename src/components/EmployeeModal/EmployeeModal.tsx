import React, { useState } from 'react';
import { IonModal } from '@ionic/react';
import type { Assignee } from '../../store/types';
import { useTaskStore } from '../../store/useTaskStore';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import './EmployeeModal.css';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (msg: string, color: string, title?: string) => void;
}

const PRESET_COLORS = [
  '#4F8EF7', '#FF5722', '#9C27B0', '#4CAF50',
  '#FF9800', '#00BCD4', '#E91E63', '#3F51B5',
  '#009688', '#795548', '#607D8B', '#673AB7',
];

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onToast }) => {
  const { teamMembers, tasks, addTeamMember, updateTeamMember, deleteTeamMember } = useTaskStore();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newAvatar, setNewAvatar] = useState('');
  const [error, setError] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  // Confirm delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('Employee name is required');
      return;
    }
    const initials = getInitials(newName);
    const avatarUrl = newAvatar.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newName)}`;

    addTeamMember({
      name: newName.trim(),
      avatar: avatarUrl,
      color: newColor,
      initials,
    });

    onToast?.(`Karyawan "${newName.trim()}" berhasil ditambahkan`, 'success', 'Sukses');
    setNewName('');
    setNewAvatar('');
    setNewColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setError('');
  };

  const startEdit = (m: Assignee) => {
    setEditingId(m.id);
    setEditName(m.name);
    setEditColor(m.color);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateTeamMember(id, {
      name: editName.trim(),
      color: editColor,
      initials: getInitials(editName),
    });
    setEditingId(null);
    onToast?.('Data karyawan diperbarui', 'success', 'Sukses');
  };

  const handleDelete = (id: string, name: string) => {
    deleteTeamMember(id);
    setDeletingId(null);
    onToast?.(`Karyawan "${name}" berhasil dihapus`, 'danger', 'Terhapus');
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="employee-modal">
      <div className="emp__wrap">
        {/* Header */}
        <div className="emp__head">
          <div className="emp__title-row">
            <Icon name="user-plus" size={18} />
            <h3>Manage Team Members</h3>
          </div>
          <button className="emp__close-btn" onClick={onClose} title="Close">
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="emp__body">
          {/* Add Employee Form */}
          <form className="emp__add-card" onSubmit={handleAdd}>
            <h4 className="emp__section-title">Add New Employee</h4>
            
            <div className="emp__form-row">
              <div className="emp__field emp__field--grow">
                <label className="emp__label">Full Name *</label>
                <input
                  type="text"
                  className={`emp__input ${error ? 'has-error' : ''}`}
                  placeholder="e.g. Sarah Jenkins"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (e.target.value.trim()) setError('');
                  }}
                  id="input-employee-name"
                />
                {error && <span className="emp__error-msg">{error}</span>}
              </div>

              <div className="emp__field">
                <label className="emp__label">Color Theme</label>
                <div className="emp__color-picker">
                  {PRESET_COLORS.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`emp__color-dot ${newColor === c ? 'active' : ''}`}
                      style={{ background: c }}
                      onClick={() => setNewColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="emp__form-row">
              <div className="emp__field emp__field--grow">
                <label className="emp__label">Avatar URL (Optional)</label>
                <input
                  type="url"
                  className="emp__input"
                  placeholder="https://... (leave empty for auto avatar)"
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  id="input-employee-avatar"
                />
              </div>

              <div className="emp__field emp__field--btn">
                <button type="submit" className="emp__btn emp__btn--primary" id="btn-add-employee">
                  <Icon name="plus" size={14} />
                  Add Employee
                </button>
              </div>
            </div>
          </form>

          {/* Employee List */}
          <div className="emp__list-sec">
            <div className="emp__list-head">
              <h4 className="emp__section-title">Team Members ({teamMembers.length})</h4>
            </div>

            <div className="emp__list">
              {teamMembers.map((m) => {
                const assignedTaskCount = tasks.filter((t) => t.assignees.includes(m.id)).length;
                const isEditing = editingId === m.id;
                const isDeleting = deletingId === m.id;

                if (isEditing) {
                  return (
                    <div key={m.id} className="emp__item emp__item--edit">
                      <Avatar assignee={{ ...m, name: editName, color: editColor }} size="md" showTooltip={false} />
                      <input
                        type="text"
                        className="emp__input emp__input--sm"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                      <div className="emp__color-mini">
                        {PRESET_COLORS.slice(0, 5).map((c) => (
                          <button
                            key={c}
                            type="button"
                            className={`emp__color-dot-sm ${editColor === c ? 'active' : ''}`}
                            style={{ background: c }}
                            onClick={() => setEditColor(c)}
                          />
                        ))}
                      </div>
                      <div className="emp__edit-actions">
                        <button
                          type="button"
                          className="emp__btn emp__btn--sm emp__btn--primary"
                          onClick={() => handleSaveEdit(m.id)}
                        >
                          <Icon name="check" size={12} /> Save
                        </button>
                        <button
                          type="button"
                          className="emp__btn emp__btn--sm emp__btn--ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={m.id} className="emp__item">
                    <div className="emp__item-left">
                      <Avatar assignee={m} size="md" showTooltip={false} />
                      <div className="emp__item-info">
                        <span className="emp__item-name">{m.name}</span>
                        <span className="emp__item-badge">
                          {assignedTaskCount} {assignedTaskCount === 1 ? 'task' : 'tasks'} assigned
                        </span>
                      </div>
                    </div>

                    <div className="emp__item-right">
                      {isDeleting ? (
                        <div className="emp__del-confirm">
                          <span>Delete?</span>
                          <button
                            type="button"
                            className="emp__btn emp__btn--xs emp__btn--danger"
                            onClick={() => handleDelete(m.id, m.name)}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            className="emp__btn emp__btn--xs emp__btn--ghost"
                            onClick={() => setDeletingId(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="emp__icon-btn"
                            onClick={() => startEdit(m)}
                            title="Edit Employee"
                          >
                            <Icon name="edit" size={14} />
                          </button>
                          <button
                            type="button"
                            className="emp__icon-btn emp__icon-btn--danger"
                            onClick={() => setDeletingId(m.id)}
                            title="Remove Employee"
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </IonModal>
  );
};

export default EmployeeModal;
