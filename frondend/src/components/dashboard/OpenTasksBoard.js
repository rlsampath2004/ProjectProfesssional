import React, { useState } from 'react';

export default function OpenTasksBoard({ tasks, onToggleTask, onAddTask, onDeleteTask }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('HIGH');
  const [newTaskCategory, setNewTaskCategory] = useState('IT ASSETS');

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'critical') return task.priority === 'CRITICAL';
    if (activeFilter === 'it') return task.category === 'IT ASSETS';
    if (activeFilter === 'olx') return task.category === 'OLX SALES';
    if (activeFilter === 'ops') return task.category === 'OPERATIONS';
    return true;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask({
      id: Date.now(),
      title: newTaskTitle,
      priority: newTaskPriority,
      category: newTaskCategory,
      due: 'TODAY 18:00',
      completed: false
    });
    setNewTaskTitle('');
  };

  const getPriorityTag = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="kd-tag kd-tag-rose">CRITICAL</span>;
      case 'HIGH':
        return <span className="kd-tag kd-tag-amber">HIGH</span>;
      default:
        return <span className="kd-tag kd-tag-neutral">NORMAL</span>;
    }
  };

  return (
    <div className="kd-panel h-100">
      {/* Header */}
      <div className="kd-panel-header flex-wrap gap-2">
        <div>
          <h6 className="mb-0 text-white fw-bold text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '0.85rem' }}>
            ACTION BOARD & CRITICAL TASKS
          </h6>
          <span className="kd-mono text-secondary" style={{ fontSize: '0.7rem' }}>
            STATUS UPDATES DIRECTLY UPDATE COMPLETION METRICS
          </span>
        </div>

        {/* Minimalist Filter Bar */}
        <div className="d-flex align-items-center gap-1">
          {[
            { id: 'all', label: 'ALL' },
            { id: 'critical', label: 'CRITICAL' },
            { id: 'it', label: 'IT ASSETS' },
            { id: 'olx', label: 'OLX' },
            { id: 'ops', label: 'OPS' }
          ].map(f => (
            <button
              key={f.id}
              className={`btn btn-sm px-2 py-0 kd-mono ${
                activeFilter === f.id ? 'kd-btn-solid' : 'kd-btn-outline'
              }`}
              style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="kd-panel-body">
        {/* Quick Add Form */}
        <form onSubmit={handleCreate} className="mb-3">
          <div className="input-group">
            <input
              type="text"
              className="form-control bg-black border-secondary text-white"
              placeholder="Add CEO priority action item..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
            <select
              className="form-select bg-black border-secondary text-secondary kd-mono"
              style={{ maxWidth: '110px', fontSize: '0.75rem' }}
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
            >
              <option value="NORMAL">NORMAL</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            <select
              className="form-select bg-black border-secondary text-secondary kd-mono d-none d-sm-block"
              style={{ maxWidth: '120px', fontSize: '0.75rem' }}
              value={newTaskCategory}
              onChange={(e) => setNewTaskCategory(e.target.value)}
            >
              <option value="IT ASSETS">IT ASSETS</option>
              <option value="OLX SALES">OLX SALES</option>
              <option value="OPERATIONS">OPERATIONS</option>
            </select>
            <button type="submit" className="kd-btn-solid">
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </form>

        {/* Task List */}
        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-4 text-secondary kd-mono small">
              NO ACTION ITEMS FOUND FOR THIS FILTER
            </div>
          ) : (
            filteredTasks.map((t) => (
              <div 
                key={t.id} 
                className="kd-task-row"
                style={{ opacity: t.completed ? 0.45 : 1 }}
              >
                <div className="d-flex align-items-center gap-3 overflow-hidden">
                  <div
                    className={`kd-task-check ${t.completed ? 'checked' : ''}`}
                    onClick={() => onToggleTask(t.id)}
                    role="checkbox"
                    aria-checked={t.completed}
                    title="Toggle Task"
                  >
                    {t.completed && <i className="bi bi-check"></i>}
                  </div>

                  <div className="overflow-hidden">
                    <div className={`text-white small fw-medium text-truncate ${t.completed ? 'text-decoration-line-through text-secondary' : ''}`}>
                      {t.title}
                    </div>
                    <div className="d-flex align-items-center gap-2 kd-mono text-secondary" style={{ fontSize: '0.68rem' }}>
                      <span className="text-white">{t.category}</span>
                      <span>/</span>
                      <span>DUE: {t.due}</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 ms-2 flex-shrink-0">
                  {getPriorityTag(t.priority)}
                  <button
                    className="btn btn-sm text-secondary hover-text-danger p-0"
                    onClick={() => onDeleteTask(t.id)}
                    title="Delete item"
                  >
                    <i className="bi bi-x-lg small"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
