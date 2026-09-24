import React, { useState, useRef, useEffect } from 'react';
import type { LabelType } from '../../store/types';
import { useTaskStore } from '../../store/useTaskStore';
import Avatar from '../common/Avatar';
import Icon from '../common/Icon';
import './BoardHeader.css';

const LABELS: LabelType[] = ['Feature', 'Bug', 'Issue', 'Undefined'];

interface BoardHeaderProps {
  onAddColumn: () => void;
  onManageTeam?: () => void;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({ onAddColumn, onManageTeam }) => {
  const { teamMembers, filter, setFilter, clearFilter, boardName, setBoardName, currentUser, setCurrentUser } = useTaskStore();
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState(false);
  const [tempBoardName, setTempBoardName] = useState(boardName);

  const filterRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const hasFilter =
    !!filter.search ||
    filter.assignees.length > 0 ||
    filter.labels.length > 0 ||
    !!filter.dueDateFrom ||
    !!filter.dueDateTo;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleAssignee = (id: string) => {
    const cur = filter.assignees;
    setFilter({ assignees: cur.includes(id) ? cur.filter(a => a !== id) : [...cur, id] });
  };

  const toggleLabel = (l: LabelType) => {
    const cur = filter.labels;
    setFilter({ labels: cur.includes(l) ? cur.filter(x => x !== l) : [...cur, l] });
  };

  const importRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const { tasks, columns } = useTaskStore.getState();
    const blob = new Blob([JSON.stringify({ columns, tasks }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'kanban-board.json'; a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.columns && data.tasks) {
          useTaskStore.setState({ columns: data.columns, tasks: data.tasks });
          alert('Board data imported successfully!');
        } else {
          alert('Invalid JSON structure');
        }
      } catch (err) {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    setExportOpen(false);
    e.target.value = '';
  };

  const LABEL_STYLE: Record<LabelType, { bg: string; color: string; border: string }> = {
    Feature:   { bg: '#E8F5E9', color: '#2E7D32', border: '#4CAF50' },
    Bug:       { bg: '#FFEBEE', color: '#C62828', border: '#F44336' },
    Issue:     { bg: '#FFF3E0', color: '#E65100', border: '#FF9800' },
    Undefined: { bg: '#F5F5F5', color: '#616161', border: '#9E9E9E' },
  };

  return (
    <header className="bh">
      {/* Left */}
      <div className="bh__left">
        {editingBoard ? (
          <div className="bh__board-edit">
            <input
              type="text"
              className="bh__board-input"
              value={tempBoardName}
              onChange={(e) => setTempBoardName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (tempBoardName.trim()) setBoardName(tempBoardName.trim());
                  setEditingBoard(false);
                }
                if (e.key === 'Escape') setEditingBoard(false);
              }}
              onBlur={() => {
                if (tempBoardName.trim()) setBoardName(tempBoardName.trim());
                setEditingBoard(false);
              }}
              id="input-board-name"
            />
          </div>
        ) : (
          <button
            className="bh__board-name"
            onClick={() => { setTempBoardName(boardName); setEditingBoard(true); }}
            title="Click to edit Perusahaan / Board Name"
            id="btn-edit-board-name"
          >
            <Icon name="board" size={15} />
            <span>{boardName}</span>
            <Icon name="edit" size={11} />
          </button>
        )}

        {/* <div className="bh__author-tag" title="Frontend Developer Take Home Test">
          <span className="bh__author-label">Created by</span>
          <strong className="bh__author-name">Stana Edro Swargara</strong>
        </div> */}

        <div className="bh__team" onClick={onManageTeam} style={{ cursor: 'pointer' }} title="Manage Team Members">
          {teamMembers.map((m, i) => (
            <div key={m.id} className="bh__av-wrap" style={{ zIndex: teamMembers.length - i }}>
              <Avatar assignee={m} size="md" />
            </div>
          ))}
          <div className="bh__av-count">+{teamMembers.length}</div>
        </div>

        <button className="bh__invite" id="btn-invite" onClick={onManageTeam}>
          <Icon name="user-plus" size={14} />
          Employees
        </button>

        {/* Active User Switcher */}
        <div className="bh__drop-wrap" ref={userRef}>
          <button
            className="bh__btn"
            onClick={() => setUserOpen(o => !o)}
            title={`Active Creator: ${currentUser.name}`}
            id="btn-active-user"
          >
            <Avatar assignee={currentUser} size="sm" showTooltip={false} />
            <span style={{ fontSize: '12px' }}>{currentUser.name.split(' ')[0]}</span>
            <Icon name="chevron-down" size={11} />
          </button>

          {userOpen && (
            <div className="bh__menu" id="user-switcher-menu" style={{ width: '210px' }}>
              <div className="bh__menu-head">Active Creator</div>
              {teamMembers.map(m => (
                <button
                  key={m.id}
                  className={`bh__menu-item ${m.id === currentUser.id ? 'active' : ''}`}
                  onClick={() => { setCurrentUser(m); setUserOpen(false); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Avatar assignee={m} size="sm" showTooltip={false} />
                    <span>{m.name}</span>
                  </div>
                  {m.id === currentUser.id && <Icon name="check" size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="bh__right">

        {/* Filter */}
        <div className="bh__drop-wrap" ref={filterRef}>
          <button
            className={`bh__btn ${hasFilter ? 'bh__btn--active' : ''}`}
            onClick={() => setFilterOpen(o => !o)}
            id="btn-filter"
          >
            <Icon name="filter" size={13} />
            Filter
            {hasFilter && <span className="bh__badge" />}
          </button>

          {filterOpen && (
            <div className="bh__panel" id="filter-panel">
              <div className="bh__panel-head">
                <span>Filters</span>
                {hasFilter && (
                  <button className="bh__clear" onClick={clearFilter} id="btn-clear-filter">
                    Clear all
                  </button>
                )}
              </div>

              <div className="bh__filter-sec">
                <p className="bh__filter-label">Assignee</p>
                <div className="bh__filter-row">
                  {teamMembers.map(m => (
                    <button
                      key={m.id}
                      className={`bh__filter-av ${filter.assignees.includes(m.id) ? 'active' : ''}`}
                      onClick={() => toggleAssignee(m.id)}
                      title={m.name}
                      style={filter.assignees.includes(m.id) ? { outline: `2px solid ${m.color}` } : {}}
                    >
                      <Avatar assignee={m} size="sm" showTooltip={false} />
                      <span>{m.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bh__filter-sec">
                <p className="bh__filter-label">Label</p>
                <div className="bh__filter-row">
                  {LABELS.map(l => (
                    <button
                      key={l}
                      className={`bh__filter-chip ${filter.labels.includes(l) ? 'active' : ''}`}
                      style={{
                        background: LABEL_STYLE[l].bg,
                        color: LABEL_STYLE[l].color,
                        borderColor: filter.labels.includes(l) ? LABEL_STYLE[l].border : 'transparent',
                      }}
                      onClick={() => toggleLabel(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bh__filter-sec">
                <p className="bh__filter-label">Due Date</p>
                <div className="bh__date-range">
                  <input
                    type="date"
                    className="bh__date-input"
                    value={filter.dueDateFrom ?? ''}
                    onChange={e => setFilter({ dueDateFrom: e.target.value || null })}
                    id="filter-date-from"
                  />
                  <span className="bh__date-sep">—</span>
                  <input
                    type="date"
                    className="bh__date-input"
                    value={filter.dueDateTo ?? ''}
                    onChange={e => setFilter({ dueDateTo: e.target.value || null })}
                    id="filter-date-to"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Export / Import */}
        <div className="bh__drop-wrap" ref={exportRef}>
          <button className="bh__btn" onClick={() => setExportOpen(o => !o)} id="btn-export">
            <Icon name="upload" size={13} />
            Export / Import
          </button>
          {exportOpen && (
            <div className="bh__menu" id="export-menu">
              <button onClick={handleExport} id="btn-export-json">
                <Icon name="download" size={13} /> Export as JSON
              </button>
              <button onClick={() => importRef.current?.click()} id="btn-import-json">
                <Icon name="upload" size={13} /> Import JSON
              </button>
            </div>
          )}
          <input ref={importRef} type="file" accept=".json" hidden onChange={handleImportFile} />
        </div>

        {/* Search */}
        <div className="bh__search">
          <Icon name="search" size={14} />
          <input
            id="input-search"
            type="text"
            placeholder="Search Tasks"
            value={filter.search}
            onChange={e => setFilter({ search: e.target.value })}
            className="bh__search-input"
            aria-label="Search tasks"
          />
          {filter.search && (
            <button
              className="bh__search-clear"
              onClick={() => setFilter({ search: '' })}
              title="Clear search"
              id="btn-search-clear"
            >
              <Icon name="x" size={12} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default BoardHeader;
