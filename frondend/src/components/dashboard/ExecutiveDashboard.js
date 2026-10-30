import React, { useState, useEffect } from 'react';
import ExecutiveStats from './ExecutiveStats';
import WeeklyProgressChart from './WeeklyProgressChart';
import TodayScheduleCalendar from './TodayScheduleCalendar';
import OpenTasksBoard from './OpenTasksBoard';
import QuickNavCards from './QuickNavCards';
import FleetSnapshot from './FleetSnapshot';
import dashboardService, { initialTasksList } from '../../services/dashboardService';

export default function ExecutiveDashboard({ onNavigateTab, onQuickLock }) {
  // Tasks state (reactive - checking a task dynamically recalculates the completion %!)
  const [tasks, setTasks] = useState(initialTasksList);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    let isMounted = true;
    dashboardService.getTasks().then(data => {
      if (isMounted && data && data.length > 0) {
        setTasks(data);
      }
    });
    dashboardService.getOverview().then(data => {
      if (isMounted && data) {
        setOverview(data);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const toggleTask = async (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    await dashboardService.toggleTask(id);
  };

  const addTask = async (newTask) => {
    const created = await dashboardService.createTask(newTask);
    setTasks([created, ...tasks]);
  };

  const deleteTask = async (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    await dashboardService.deleteTask(id);
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
        weeklyTargetPercent={overview ? Math.min(100, Math.round((completedCount / (totalCount || 1)) * 100) + 15) : 94}
        pendingAlertsCount={overview ? overview.totalDiscrepanciesCount : (tasks.filter(t => !t.completed && t.priority === 'CRITICAL').length || 1)}
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
