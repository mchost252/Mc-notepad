import React, { useState } from 'react';
import { Clock, Calendar, Flag, Edit2, Trash2 } from 'lucide-react';
import type { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const showNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
    });
    setTimeout(() => notification.close(), 3000);
  }
};

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editScheduledDate, setEditScheduledDate] = useState(
    task.scheduledDate ? task.scheduledDate.toISOString().split('T')[0] : ''
  );
  const [editScheduledTime, setEditScheduledTime] = useState(task.scheduledTime || '');
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');

  const handleSave = () => {
    const updatedTask: Task = {
      ...task,
      title: editTitle,
      description: editDescription,
      scheduledDate: editScheduledDate ? new Date(editScheduledDate) : undefined,
      scheduledTime: editScheduledTime,
      priority: editPriority as 'low' | 'medium' | 'high',
    };
    onEdit(updatedTask);
    setIsEditing(false);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const isOverdue = () => {
    if (!task.scheduledDate) return false;
    const now = new Date();
    const taskDateTime = new Date(task.scheduledDate);
    if (task.scheduledTime) {
      const [hours, minutes] = task.scheduledTime.split(':');
      taskDateTime.setHours(parseInt(hours), parseInt(minutes));
    }
    return taskDateTime < now && !task.completed;
  };

  // Show notification for overdue tasks
  React.useEffect(() => {
    if (isOverdue() && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Task Overdue', {
        body: `Task "${task.title}" is overdue`,
        icon: '/icon-192.png',
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);
    }
  }, [task, isOverdue]);

  if (isEditing) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
            placeholder="Task description (optional)"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={editScheduledDate}
              onChange={(e) => setEditScheduledDate(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="time"
              value={editScheduledTime}
              onChange={(e) => setEditScheduledTime(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 p-4 rounded-lg border transition-colors ${
      task.completed ? 'border-green-600 bg-gray-800/50' : 'border-gray-700'
    } ${isOverdue() ? 'border-red-500' : ''}`}>
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => {
            if (!task.completed) {
              showNotification('Task Completed! 🎉', `Great job completing "${task.title}"`);
            }
            onToggle(task.id);
          }}
          className="mt-1 w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className={`font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.title}
            </h3>
            {task.priority && (
              <Flag className={`w-4 h-4 ${getPriorityColor(task.priority)}`} />
            )}
          </div>

          {task.description && (
            <p className={`text-sm mb-2 ${task.completed ? 'text-gray-600' : 'text-gray-300'}`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {task.scheduledDate && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{task.scheduledDate.toLocaleDateString()}</span>
              </div>
            )}
            {task.scheduledTime && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{task.scheduledTime}</span>
              </div>
            )}
            {isOverdue() && (
              <span className="text-red-400 font-medium">Overdue</span>
            )}
          </div>
        </div>

        <div className="flex space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;