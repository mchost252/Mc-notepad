import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useTimer } from '../hooks/useTimer';
import TaskItem from '../components/TaskItem';
import NoteEditor from '../components/NoteEditor';

const motivationalQuotes = [
  "The only way to do great work is to love what you do.",
  "Focus on being productive instead of busy.",
  "Small daily improvements lead to stunning results.",
  "Your future self will thank you for starting today.",
  "Discipline is the bridge between goals and accomplishment.",
];

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [showBacklog, setShowBacklog] = useState(false);
  const [quote, setQuote] = useState('');

  const {
    tasks,
    getTodayTasks,
    getCompletedTodayCount,
    getTotalTodayCount,
    toggleTask,
    updateTask,
    addTask,
    deleteTask,
    clearCompletedTasks,
  } = useTasks();


  const {
    timeLeft,
    isRunning,
    isBreak,
    workDuration,
    breakDuration,
    start,
    pause,
    reset,
    setWorkDuration,
    setBreakDuration,
    formatTime,
  } = useTimer();

  const todayTasks = getTodayTasks();
  const completedCount = getCompletedTodayCount();
  const totalCount = getTotalTodayCount();
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Change quote daily
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setQuote(motivationalQuotes[dayOfYear % motivationalQuotes.length]);
  }, []);


  const handleAddTask = async () => {
    const title = prompt('Enter task title:');
    if (title?.trim()) {
      await addTask(title.trim());
    }
  };

  const handleSaveNote = async () => {
    // This will be handled by the NoteEditor component
    setShowNoteEditor(false);
  };

  const handleClearCompletedTasks = async () => {
    if (window.confirm('Are you sure you want to delete all completed tasks? This action cannot be undone.')) {
      try {
        await clearCompletedTasks();
      } catch (error) {
        console.error('Failed to clear completed tasks:', error);
        alert('Failed to clear completed tasks. Please try again.');
      }
    }
  };


  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-gray-800 rounded-lg p-6 relative">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h1>
            <p className="text-gray-400 text-lg">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <blockquote className="text-gray-300 italic border-l-4 border-blue-500 pl-4 mt-4">
              "{quote}"
            </blockquote>
          </div>

          {/* Progress Tracker - Top Right */}
          <div className="ml-6">
            <div className="text-center">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-gray-700"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${progressPercentage}, 100`}
                    className="text-blue-500 transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{completedCount}/{totalCount}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {totalCount === 0 ? 'No tasks' : `${Math.round(progressPercentage)}%`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Today's Tasks</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowBacklog(!showBacklog)}
              className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm"
            >
              {showBacklog ? 'Hide' : 'View'} All Tasks
            </button>
            <button
              onClick={handleAddTask}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
            >
              + Add Task
            </button>
          </div>
        </div>
        {todayTasks.length === 0 ? (
          <p className="text-gray-400">No tasks for today. Add your first task!</p>
        ) : (
          <div className="space-y-3">
            {todayTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={updateTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}

        {/* Task Backlog - Expandable */}
        {showBacklog && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">All Tasks</h3>
              {tasks.some(task => task.completed) && (
                <button
                  onClick={handleClearCompletedTasks}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm text-white"
                >
                  Clear Completed
                </button>
              )}
            </div>
            {tasks.length === 0 ? (
              <p className="text-gray-400">No tasks yet. Add your first task!</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks
                  .sort((a, b) => {
                    // Sort by completion status first (incomplete first), then by priority and due date
                    if (a.completed !== b.completed) {
                      return a.completed ? 1 : -1; // Incomplete tasks first
                    }

                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    const aPriority = priorityOrder[a.priority || 'medium'];
                    const bPriority = priorityOrder[b.priority || 'medium'];

                    if (aPriority !== bPriority) return bPriority - aPriority;

                    if (a.scheduledDate && b.scheduledDate) {
                      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
                    }
                    if (a.scheduledDate) return -1;
                    if (b.scheduledDate) return 1;
                    return 0;
                  })
                  .map(task => (
                    <div key={task.id} className={`p-2 rounded ${task.completed ? 'bg-gray-700/50' : 'bg-gray-700/30'}`}>
                      <TaskItem
                        task={task}
                        onToggle={toggleTask}
                        onEdit={updateTask}
                        onDelete={deleteTask}
                      />
                      {task.completed && (
                        <p className="text-xs text-green-400 mt-1 ml-8">✓ Completed</p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>


      {/* Timer Widget */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {isBreak ? 'Break Time' : 'Focus Session'}
        </h2>
        <div className="text-center">
          <div className="text-4xl font-mono font-bold mb-4">
            {formatTime(timeLeft)}
          </div>

          {/* Timer Controls */}
          <div className="flex justify-center space-x-4 mb-4">
            {!isRunning ? (
              <button
                onClick={start}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Play className="w-5 h-5" />
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={pause}
                className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
            )}
            <button
              onClick={reset}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Timer Settings */}
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Work (min)</label>
              <input
                type="number"
                value={workDuration}
                onChange={(e) => setWorkDuration(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Break (min)</label>
              <input
                type="number"
                value={breakDuration}
                onChange={(e) => setBreakDuration(Number(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                min="1"
                max="60"
              />
            </div>
          </div>
        </div>
      </div>


      {showNoteEditor && (
        <NoteEditor
          onSave={handleSaveNote}
          onCancel={() => setShowNoteEditor(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;