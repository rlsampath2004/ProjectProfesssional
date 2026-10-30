import React, { useState, useMemo } from 'react';

export default function TodayScheduleCalendar() {
  const today = useMemo(() => new Date(), []);
  const todayDateNum = today.getDate();
  const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  const currentMonthShort = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  const [selectedDate, setSelectedDate] = useState(todayDateNum);
  
  // Schedule items organized by date (defaults for today and tomorrow)
  const [scheduleData, setScheduleData] = useState(() => {
    try {
      const saved = localStorage.getItem('kd_schedule_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      [todayDateNum]: [
        {
          id: 1,
          time: '09:30',
          title: 'IT Hardware Stocktake & SIM Inventory Audit',
          category: 'AUDIT',
          done: true
        },
        {
          id: 2,
          time: '11:15',
          title: 'Warehouse A4 & Thermal Label Printers Firmware Review',
          category: 'HARDWARE',
          done: true
        },
        {
          id: 3,
          time: '14:30',
          title: 'Authorise Laptop Allocations for New Engineers',
          category: 'ALLOCATION',
          done: false,
          current: true
        },
        {
          id: 4,
          time: '16:00',
          title: 'OLX Buyer Negotiation & Price Closing (Decommissioned Units)',
          category: 'OLX SALES',
          done: false
        },
        {
          id: 5,
          time: '17:45',
          title: 'Daily Hours & Operational Wrap-Up with Branch Leads',
          category: 'EXECUTIVE',
          done: false
        }
      ],
      [todayDateNum + 1]: [
        {
          id: 6,
          time: '10:00',
          title: 'Weekly Management Hours Review & Payroll Verification',
          category: 'EXECUTIVE',
          done: false
        },
        {
          id: 7,
          time: '14:00',
          title: 'Vendor Bulk Invoice Import & Excel Reconciliation',
          category: 'OPERATIONS',
          done: false
        }
      ]
    };
  });

  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('18:30');
  const [newEventCategory, setNewEventCategory] = useState('EXECUTIVE');
  const [showAddForm, setShowAddForm] = useState(false);

  // Active items for selected date
  const currentItems = scheduleData[selectedDate] || [];

  const toggleEventDone = (id) => {
    const updated = currentItems.map(item => 
      item.id === id ? { ...item, done: !item.done, current: false } : item
    );
    const nextState = { ...scheduleData, [selectedDate]: updated };
    setScheduleData(nextState);
    try { localStorage.setItem('kd_schedule_data', JSON.stringify(nextState)); } catch (e) {}
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const newEntry = {
      id: Date.now(),
      time: newEventTime,
      title: newEventTitle,
      category: newEventCategory,
      done: false
    };
    const updated = [...currentItems, newEntry];
    const nextState = { ...scheduleData, [selectedDate]: updated };
    setScheduleData(nextState);
    try { localStorage.setItem('kd_schedule_data', JSON.stringify(nextState)); } catch (e) {}
    setNewEventTitle('');
    setShowAddForm(false);
  };

  // Dynamically compute calendar days for current week (Mon-Sun)
  const calendarDays = useMemo(() => {
    const d = new Date(today);
    const dayOfWeek = d.getDay(); // 0 is Sun, 1 is Mon
    const distToMon = (dayOfWeek + 6) % 7;
    d.setDate(d.getDate() - distToMon);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(d);
      cur.setDate(d.getDate() + i);
      const dayNum = cur.getDate();
      const isCurMonth = cur.getMonth() === today.getMonth();
      const isToday = cur.toDateString() === today.toDateString();
      const hasEvents = Boolean(scheduleData[dayNum] && scheduleData[dayNum].length > 0);
      days.push({
        day: dayNum,
        isCurrentMonth: isCurMonth,
        isToday,
        hasEvents
      });
    }
    return days;
  }, [today, scheduleData]);

  return (
    <div className="kd-panel h-100">
      {/* Header */}
      <div className="kd-panel-header">
        <div>
          <h6 className="mb-0 text-white fw-bold text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '0.85rem' }}>
            CALENDAR &amp; EXECUTIVE SCHEDULE
          </h6>
          <span className="kd-mono text-secondary" style={{ fontSize: '0.7rem' }}>
            TIMELINE • {currentMonth}
          </span>
        </div>

        <button
          className="kd-btn-outline py-1 px-2"
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ fontSize: '0.72rem' }}
        >
          <i className={`bi ${showAddForm ? 'bi-x' : 'bi-plus'}`}></i>
          <span className="ms-1">{showAddForm ? 'CANCEL' : 'ADD'}</span>
        </button>
      </div>

      {/* Body */}
      <div className="kd-panel-body">
        {/* Interactive Weekly / Monthly Strip */}
        <div className="p-2 mb-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
          <div className="d-flex align-items-center justify-content-between mb-2 px-1">
            <span className="kd-mono text-secondary fw-semibold" style={{ fontSize: '0.7rem' }}>WEEKLY TIMELINE</span>
            <span className="kd-tag kd-tag-neutral py-0" style={{ fontSize: '0.65rem' }}>TODAY: {todayDateNum} {currentMonthShort}</span>
          </div>

          <div className="row g-1 text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => {
              const dayObj = calendarDays[idx];
              const isSelected = selectedDate === dayObj.day;
              return (
                <div key={idx} className="col">
                  <div className="kd-mono text-secondary mb-1" style={{ fontSize: '0.65rem' }}>{dayName}</div>
                  <div
                    onClick={() => setSelectedDate(dayObj.day)}
                    className="py-1 rounded-1 position-relative"
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'var(--kd-text-1)' : (dayObj.isToday ? 'var(--kd-surface-3)' : 'transparent'),
                      color: isSelected ? 'var(--kd-surface-0)' : (dayObj.isCurrentMonth ? 'var(--kd-text-1)' : 'var(--kd-text-3)'),
                      fontWeight: isSelected || dayObj.isToday ? '700' : '500',
                      fontSize: '0.78rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      border: dayObj.isToday && !isSelected ? '1px solid var(--kd-border-active)' : '1px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {dayObj.day}
                    {dayObj.hasEvents && (
                      <span 
                        style={{
                          position: 'absolute',
                          bottom: 2,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          backgroundColor: isSelected ? 'var(--kd-surface-0)' : '#10b981'
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Add Form Drawer */}
        {showAddForm && (
          <form onSubmit={handleAddEvent} className="p-3 mb-3 rounded-2" style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}>
            <div className="row g-2 mb-2">
              <div className="col-12">
                <input
                  type="text"
                  className="form-control form-control-sm bg-black border-secondary text-white"
                  placeholder="Schedule title..."
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="col-6">
                <input
                  type="text"
                  className="form-control form-control-sm bg-black border-secondary text-white kd-mono"
                  placeholder="18:30"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                />
              </div>
              <div className="col-6">
                <select
                  className="form-select form-select-sm bg-black border-secondary text-white kd-mono"
                  value={newEventCategory}
                  onChange={(e) => setNewEventCategory(e.target.value)}
                >
                  <option value="EXECUTIVE">EXECUTIVE</option>
                  <option value="AUDIT">AUDIT</option>
                  <option value="ALLOCATION">ALLOCATION</option>
                  <option value="OLX SALES">OLX SALES</option>
                </select>
              </div>
            </div>
            <button type="submit" className="kd-btn-solid w-100 py-1 justify-content-center" style={{ fontSize: '0.75rem' }}>
              SAVE TO {selectedDate} {currentMonthShort} SCHEDULE
            </button>
          </form>
        )}

        {/* Chronological Timeline */}
        <div className="pt-1" style={{ maxHeight: '280px', overflowY: 'auto' }}>
          {currentItems.length === 0 ? (
            <div className="text-center py-4 text-secondary kd-mono small">
              <i className="bi bi-calendar-check fs-4 d-block mb-1 text-secondary opacity-50"></i>
              NO COMMITMENTS SCHEDULED FOR {selectedDate} {currentMonthShort}
            </div>
          ) : (
            currentItems.map((item) => (
              <div key={item.id} className="kd-timeline-block">
                {/* Node */}
                <div 
                  className={`kd-timeline-node ${item.current ? 'active' : ''}`}
                  style={{
                    borderColor: item.done ? '#10b981' : undefined,
                    color: item.done ? '#10b981' : undefined
                  }}
                >
                  <i className={`bi ${item.done ? 'bi-check2' : item.current ? 'bi-dot fs-5' : 'bi-dash'}`}></i>
                </div>

                {/* Content */}
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="kd-mono text-secondary" style={{ fontSize: '0.72rem' }}>
                      {item.time} HRS
                    </span>
                    <span className="kd-tag kd-tag-neutral" style={{ fontSize: '0.62rem' }}>
                      {item.category}
                    </span>
                  </div>

                  <div 
                    className={`d-flex align-items-center justify-content-between p-2 rounded-2 ${item.done ? 'opacity-40 text-decoration-line-through' : ''}`}
                    style={{ background: 'var(--kd-surface-2)', border: '1px solid var(--kd-border)' }}
                  >
                    <span className="small text-white fw-medium">{item.title}</span>
                    <button
                      className="btn btn-sm p-0 ms-2 text-secondary hover-text-white"
                      onClick={() => toggleEventDone(item.id)}
                      title={item.done ? "Mark pending" : "Mark done"}
                    >
                      <i className={`bi ${item.done ? 'bi-check-circle-fill text-success' : 'bi-circle'} small`}></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
