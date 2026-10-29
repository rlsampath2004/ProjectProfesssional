import React, { useState } from 'react';
import ExecutiveStats from './ExecutiveStats';
import WeeklyProgressChart from './WeeklyProgressChart';
import TodayScheduleCalendar from './TodayScheduleCalendar';
import OpenTasksBoard from './OpenTasksBoard';
import QuickNavCards from './QuickNavCards';
import FleetSnapshot from './FleetSnapshot';

export default function ExecutiveDashboard({ onNavigateTab, onQuickLock }) {
  // Tasks state (reactive - checking a task dynamically recalculates the completion %!)
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Sign off quarterly IT physical stocktake for Branch B',
      priority: 'CRITICAL',
      category: 'IT ASSETS',
      due: 'TODAY 17:00',
      completed: false
    },
    {
      id: 2,
      title: 'Verify OLX payment received for 2 sold Lenovo ThinkPads',
      priority: 'HIGH',
      category: 'OLX SALES',
      due: 'TODAY 18:30',
      completed: false
    },
    {
      id: 3,
      title: 'Approve allocation of Dell 24" Monitors to Billing Desk',
      priority: 'NORMAL',
      category: 'IT ASSETS',
      due: 'TODAY 19:00',
      completed: true
    },
    {
      id: 4,
      title: 'Review weekly hours report and overtime entries',
      priority: 'NORMAL',
      category: 'OPERATIONS',
      due: 'TOMORROW 10:00',
      completed: true
    },
    {
      id: 5,
      title: 'Import latest vendor hardware invoices via Excel',
      priority: 'HIGH',
      category: 'OPERATIONS',
      due: 'TOMORROW 14:00',
      completed: true
    }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div>
      {/* Executive Command Strip */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="kd-tag kd-tag-neutral">CEO CONFIDENTIAL</span>
            <span className="kd-mono text-secondary" style={{ fontSize: '0.7rem' }}>• ALL 3 BRANCHES ONLINE</span>
          </div>
          <h3 className="text-white fw-bold mb-0" style={{ letterSpacing: '-0.035em' }}>
            Executive Operations Command
          </h3>
          <p className="text-secondary small mb-0">
            Real-time IT hardware inventory, daily productivity, schedule, and OLX sales pipeline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button 
            className="kd-btn-outline"
            onClick={() => onNavigateTab('excel')}
            title="Import Excel spreadsheet"
          >
            <i className="bi bi-file-earmark-spreadsheet"></i>
            <span>IMPORT EXCEL</span>
          </button>

          <button 
            className="kd-btn-outline"
            onClick={() => onNavigateTab('audit')}
            title="Start stock audit"
          >
            <i className="bi bi-patch-check"></i>
            <span>STOCK AUDIT</span>
          </button>

          <button 
            className="kd-btn-solid"
            onClick={onQuickLock}
            title="Lock Dashboard (Protects against 6 laptop users)"
          >
            <i className="bi bi-lock-fill"></i>
            <span>LOCK SCREEN</span>
          </button>
        </div>
      </div>

      {/* Row 1: KPI Tiles */}
      <ExecutiveStats 
        hoursLogged="06h 45m"
        completedTasks={completedCount}
        totalTasks={totalCount}
        weeklyTargetPercent={94}
        pendingAlertsCount={tasks.filter(t => !t.completed && t.priority === 'CRITICAL').length || 1}
        onNavigateTab={onNavigateTab}
      />

      {/* Row 2: Operational Modules */}
      <QuickNavCards onNavigateTab={onNavigateTab} />

      {/* Row 3: Analytics & Execution Grid */}
      <div className="row g-3 mb-4">
        {/* Left Column: Trajectory Chart + Hardware Fleet */}
        <div className="col-12 col-lg-7 d-flex flex-column gap-3">
          <WeeklyProgressChart />
          <FleetSnapshot onNavigateTab={onNavigateTab} />
        </div>

        {/* Right Column: Schedule Agenda + Action Board */}
        <div className="col-12 col-lg-5 d-flex flex-column gap-3">
          <TodayScheduleCalendar />
          <OpenTasksBoard 
            tasks={tasks}
            onToggleTask={toggleTask}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
          />
        </div>
      </div>
    </div>
  );
}
