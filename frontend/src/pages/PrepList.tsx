import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Circle, Plus, Trash2, Beef, Carrot, Droplet } from 'lucide-react';

interface PrepTask {
  id: string;
  text: string;
  completed: boolean;
}

interface PrepData {
  meats: PrepTask[];
  veggies: PrepTask[];
  sauces: PrepTask[];
}

const DEFAULT_PREP_DATA: PrepData = {
  meats: [
    { id: 'm1', text: 'Marinate 10kg Chicken Tikka', completed: false },
    { id: 'm2', text: 'Portion Atlantic Salmon', completed: true },
    { id: 'm3', text: 'Prepare Beef Patty mix', completed: false },
  ],
  veggies: [
    { id: 'v1', text: 'Chop 5kg Onions', completed: false },
    { id: 'v2', text: 'Dice Bell Peppers', completed: false },
    { id: 'v3', text: 'Peel Garlic (2kg)', completed: true },
  ],
  sauces: [
    { id: 's1', text: 'Prepare Base Makhani Gravy', completed: false },
    { id: 's2', text: 'Blend Mint Chutney', completed: true },
    { id: 's3', text: 'Reduce Balsamic Glaze', completed: false },
  ]
};

export default function PrepList() {
  const [data, setData] = useState<PrepData>(() => {
    const saved = localStorage.getItem('chefPrepData');
    if (saved) return JSON.parse(saved);
    return DEFAULT_PREP_DATA;
  });

  const [newTasks, setNewTasks] = useState({
    meats: '',
    veggies: '',
    sauces: ''
  });

  useEffect(() => {
    localStorage.setItem('chefPrepData', JSON.stringify(data));
  }, [data]);

  // Calculate Progress
  const allTasks = [...data.meats, ...data.veggies, ...data.sauces];
  const completedTasks = allTasks.filter(t => t.completed).length;
  const progressPercent = allTasks.length === 0 ? 100 : Math.round((completedTasks / allTasks.length) * 100);

  const toggleTask = (category: keyof PrepData, id: string) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const deleteTask = (category: keyof PrepData, id: string) => {
    setData(prev => ({
      ...prev,
      [category]: prev[category].filter(task => task.id !== id)
    }));
  };

  const addTask = (category: keyof PrepData, e: React.FormEvent) => {
    e.preventDefault();
    const text = newTasks[category].trim();
    if (!text) return;

    setData(prev => ({
      ...prev,
      [category]: [...prev[category], { id: Date.now().toString(), text, completed: false }]
    }));

    setNewTasks(prev => ({ ...prev, [category]: '' }));
  };

  const renderCategory = (categoryKey: keyof PrepData, title: string, Icon: any, color: string) => {
    const tasks = data[categoryKey];
    
    // Sort so completed are at the bottom
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });

    return (
      <div style={{ background: '#161922', borderRadius: '16px', border: '1px solid #1f2330', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Category Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1f2330', background: '#1a1d27', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#0f1219', padding: '8px', borderRadius: '8px' }}>
            <Icon size={20} color={color} />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>{title}</h2>
          <div style={{ marginLeft: 'auto', background: '#0f1219', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600 }}>
            {tasks.filter(t => t.completed).length} / {tasks.length}
          </div>
        </div>

        {/* Task List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {sortedTasks.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '24px 0', fontSize: '0.9rem' }}>No tasks in this category.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedTasks.map(task => (
                <div key={task.id} style={{ 
                  display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', 
                  background: task.completed ? '#0f1219' : '#1f2330', 
                  borderRadius: '12px',
                  opacity: task.completed ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                  border: task.completed ? '1px dashed #1f2330' : '1px solid transparent'
                }}>
                  
                  <button onClick={() => toggleTask(categoryKey, task.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', marginTop: '2px' }}>
                    {task.completed ? (
                      <CheckCircle2 size={20} color={color} />
                    ) : (
                      <Circle size={20} color="#64748b" />
                    )}
                  </button>

                  <span style={{ 
                    flex: 1, 
                    color: task.completed ? '#64748b' : '#f8fafc',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    fontSize: '0.95rem',
                    lineHeight: 1.4
                  }}>
                    {task.text}
                  </span>

                  <button onClick={() => deleteTask(categoryKey, task.id)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#ef4444', opacity: 0.5 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Task Input */}
        <div style={{ padding: '16px', borderTop: '1px solid #1f2330', background: '#1a1d27' }}>
          <form onSubmit={(e) => addTask(categoryKey, e)} style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="Add prep task..."
              value={newTasks[categoryKey]}
              onChange={e => setNewTasks(prev => ({ ...prev, [categoryKey]: e.target.value }))}
              style={{ flex: 1, background: '#0f1219', border: '1px solid #1f2330', padding: '10px 12px', borderRadius: '8px', color: '#f8fafc', fontSize: '0.9rem', outline: 'none' }}
            />
            <button type="submit" disabled={!newTasks[categoryKey].trim()} style={{ background: color, border: 'none', color: 'white', padding: '10px', borderRadius: '8px', cursor: newTasks[categoryKey].trim() ? 'pointer' : 'default', opacity: newTasks[categoryKey].trim() ? 1 : 0.5 }}>
              <Plus size={18} />
            </button>
          </form>
        </div>

      </div>
    );
  };

  return (
    <div style={{ padding: '32px', background: '#0f1219', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: '#f8fafc' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ background: '#43210b', color: '#f97316', padding: '12px', borderRadius: '12px' }}>
            <ClipboardList size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#f8fafc', margin: '0 0 4px 0', fontWeight: 'bold' }}>Daily Preparation List</h1>
            <p style={{ margin: 0, color: '#9ca3af' }}>Track and manage your kitchen prep tasks for the day.</p>
          </div>
        </div>

        <button onClick={() => { if(confirm('Reset all tasks to default?')) { localStorage.removeItem('chefPrepData'); setData(DEFAULT_PREP_DATA); } }} style={{ background: 'transparent', border: '1px solid #1f2330', color: '#9ca3af', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Reset List
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ background: '#161922', borderRadius: '16px', padding: '24px', border: '1px solid #1f2330', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
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
        <p style={{ margin: '12px 0 0 0', color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center' }}>
          {completedTasks} of {allTasks.length} tasks completed today.
        </p>
      </div>

      {/* Categories Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', height: 'calc(100vh - 280px)', minHeight: '500px' }}>
        {renderCategory('meats', 'Meats & Marinades', Beef, '#ef4444')}
        {renderCategory('veggies', 'Veggies & Aromatics', Carrot, '#22c55e')}
        {renderCategory('sauces', 'Sauces & Bases', Droplet, '#3b82f6')}
      </div>

    </div>
  );
}
