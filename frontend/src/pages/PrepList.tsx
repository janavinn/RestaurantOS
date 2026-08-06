import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Circle, Plus, Trash2, Clock, PlayCircle } from 'lucide-react';

interface PrepTask {
  id: string;
  text: string;
  status: 'todo' | 'in-progress' | 'done';
}

const DEFAULT_TASKS: PrepTask[] = [
  { id: 'm1', text: 'Marinate 10kg Chicken Tikka', status: 'todo' },
  { id: 'm2', text: 'Portion Atlantic Salmon', status: 'done' },
  { id: 'm3', text: 'Prepare Beef Patty mix', status: 'in-progress' },
  { id: 'v1', text: 'Chop 5kg Onions', status: 'todo' },
  { id: 'v2', text: 'Dice Bell Peppers', status: 'todo' },
  { id: 'v3', text: 'Peel Garlic (2kg)', status: 'done' },
  { id: 's1', text: 'Prepare Base Makhani Gravy', status: 'in-progress' },
  { id: 's2', text: 'Blend Mint Chutney', status: 'done' },
  { id: 's3', text: 'Reduce Balsamic Glaze', status: 'todo' }
];

export default function PrepList() {
  const [tasks, setTasks] = useState<PrepTask[]>(() => {
    const saved = localStorage.getItem('chefKanbanData');
    if (saved) return JSON.parse(saved);
    return DEFAULT_TASKS;
  });

  const [newTaskText, setNewTaskText] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('chefKanbanData', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), text: newTaskText.trim(), status: 'todo' }]);
    setNewTaskText('');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to make dragged item look better
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5';
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: PrepTask['status']) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    setTasks(prev => prev.map(task => 
      task.id === draggedTaskId ? { ...task, status } : task
    ));
    setDraggedTaskId(null);
  };

  const renderColumn = (status: PrepTask['status'], title: string, Icon: any, color: string) => {
    const columnTasks = tasks.filter(t => t.status === status);

    return (
      <div 
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
        style={{ 
          background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', 
          display: 'flex', flexDirection: 'column', height: '100%',
          transition: 'all 0.2s ease',
          boxShadow: draggedTaskId ? 'inset 0 0 0 1px rgba(255,255,255,0.05)' : 'none'
        }}
      >
        {/* Column Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1f2330', background: '#1a1d27', display: 'flex', alignItems: 'center', gap: '12px', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div style={{ background: '#0f1219', padding: '8px', borderRadius: '8px' }}>
            <Icon size={20} color={color} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>{title}</h2>
          <div style={{ marginLeft: 'auto', background: '#0f1219', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>
            {columnTasks.length}
          </div>
        </div>

        {/* Task List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {columnTasks.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: '32px 0', fontSize: '0.9rem', border: '2px dashed #1f2330', borderRadius: '12px', background: '#0f1219' }}>
              Drop tasks here
            </div>
          ) : (
            columnTasks.map(task => (
              <div 
                key={task.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragEnd={handleDragEnd}
                style={{ 
                  display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', 
                  background: status === 'done' ? '#0f1219' : '#1a1d27', 
                  borderRadius: '12px',
                  border: status === 'done' ? '1px solid transparent' : '1px solid #2a2f3e',
                  cursor: 'grab',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              >
                {status === 'done' ? (
                  <CheckCircle2 size={20} color={color} style={{ marginTop: '2px', flexShrink: 0 }} />
                ) : status === 'in-progress' ? (
                  <PlayCircle size={20} color={color} style={{ marginTop: '2px', flexShrink: 0 }} />
                ) : (
                  <Circle size={20} color={color} style={{ marginTop: '2px', flexShrink: 0 }} />
                )}

                <span style={{ 
                  flex: 1, 
                  color: status === 'done' ? '#64748b' : '#f8fafc',
                  textDecoration: status === 'done' ? 'line-through' : 'none',
                  fontSize: '0.95rem',
                  lineHeight: 1.4,
                  userSelect: 'none'
                }}>
                  {task.text}
                </span>

                <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#ef4444', opacity: 0.5, transition: 'opacity 0.2s' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const progressPercent = tasks.length === 0 ? 100 : Math.round((completedTasks / tasks.length) * 100);

  return (
    <div style={{ padding: '32px', background: '#0f1219', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#43210b', color: '#f97316', padding: '12px', borderRadius: '12px' }}>
            <ClipboardList size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Kanban Prep Board</h1>
            <p style={{ margin: 0, color: '#9ca3af' }}>Drag and drop to manage your kitchen preparation workflow.</p>
          </div>
        </div>

        <button onClick={() => { if(confirm('Reset all tasks to default?')) { localStorage.removeItem('chefKanbanData'); setTasks(DEFAULT_TASKS); } }} style={{ background: 'transparent', border: '1px solid #1f2330', color: '#9ca3af', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Reset Board
        </button>
      </div>

      {/* Controls & Progress */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        
        {/* Add Task */}
        <div style={{ flex: 1, background: '#161922', borderRadius: '16px', padding: '24px', border: '1px solid #1f2330' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 600 }}>Quick Add</h3>
          <form onSubmit={addTask} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="E.g., Marinate 5kg chicken..."
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              style={{ flex: 1, background: '#0f1219', border: '1px solid #1f2330', padding: '12px 16px', borderRadius: '8px', color: '#f8fafc', fontSize: '0.95rem', outline: 'none' }}
            />
            <button type="submit" disabled={!newTaskText.trim()} style={{ background: '#f97316', border: 'none', color: 'white', padding: '0 24px', borderRadius: '8px', cursor: newTaskText.trim() ? 'pointer' : 'default', opacity: newTaskText.trim() ? 1 : 0.5, fontWeight: 600 }}>
              Add Task
            </button>
          </form>
        </div>

        {/* Progress Bar */}
        <div style={{ flex: 1, background: '#161922', borderRadius: '16px', padding: '24px', border: '1px solid #1f2330' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Shift Progress</h3>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f97316' }}>{progressPercent}%</span>
          </div>
          <div style={{ width: '100%', height: '12px', background: '#0f1219', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              background: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
              width: `${progressPercent}%`,
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              borderRadius: '12px'
            }}></div>
          </div>
          <p style={{ margin: '12px 0 0 0', color: '#9ca3af', fontSize: '0.9rem' }}>
            {completedTasks} of {tasks.length} tasks completed today.
          </p>
        </div>

      </div>

      {/* Kanban Board */}
      <div className="mobile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', flex: 1, minHeight: '500px' }}>
        {renderColumn('todo', 'To Do', Clock, '#64748b')}
        {renderColumn('in-progress', 'In Progress', PlayCircle, '#f59e0b')}
        {renderColumn('done', 'Done', CheckCircle2, '#22c55e')}
      </div>

    </div>
  );
}
