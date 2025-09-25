import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';

const Review: React.FC = () => {
  const { tasks } = useTasks();
  const { allNotes } = useNotes();
  const [nextWeekGoals, setNextWeekGoals] = useState<string[]>(['', '', '']);

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const weekTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= weekStart && taskDate < weekEnd;
    });

    const completedTasks = weekTasks.filter(task => task.completed);
    const weekNotes = allNotes.filter(note => {
      const noteDate = new Date(note.createdAt);
      return noteDate >= weekStart && noteDate < weekEnd;
    });

    // Calculate focus time from timer sessions
    // This would need timer session data, for now we'll show a placeholder

    return {
      totalTasks: weekTasks.length,
      completedTasks: completedTasks.length,
      totalNotes: weekNotes.length,
      focusTime: 0, // Placeholder - would calculate from timer sessions
    };
  };

  const stats = getWeeklyStats();

  const getWeeklyHighlights = () => {
    // Get completed tasks as wins
    const completedTasks = tasks.filter(task => task.completed);
    const recentCompleted = completedTasks.slice(-5); // Last 5 completed tasks

    return recentCompleted.map(task => task.title);
  };

  const getBlockers = () => {
    // This could be based on notes tagged with certain keywords
    // For now, return some example blockers
    return [
      'Need to improve morning routine consistency',
      'Distractions during deep work sessions',
      'Time management for learning vs work balance'
    ];
  };

  const highlights = getWeeklyHighlights();
  const blockers = getBlockers();

  const handleGoalChange = (index: number, value: string) => {
    const newGoals = [...nextWeekGoals];
    newGoals[index] = value;
    setNextWeekGoals(newGoals);
  };

  const saveGoals = () => {
    // In a real app, you'd save these to the database
    alert('Goals saved! (This would be persisted in a real implementation)');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Weekly Review</h1>

      {/* Weekly Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">This Week's Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.totalTasks}</div>
            <div className="text-sm text-gray-400">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.completedTasks}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.totalNotes}</div>
            <div className="text-sm text-gray-400">Notes Added</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.focusTime}h</div>
            <div className="text-sm text-gray-400">Focus Time</div>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🎉 Wins & Highlights</h2>
        {highlights.length === 0 ? (
          <p className="text-gray-400">Complete some tasks to see your wins here!</p>
        ) : (
          <ul className="space-y-2">
            {highlights.map((highlight, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Blockers/Confused Areas */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🤔 Blockers & Areas for Improvement</h2>
        <ul className="space-y-2">
          {blockers.map((blocker, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-red-400 mt-1">•</span>
              <span>{blocker}</span>
            </li>
          ))}
        </ul>
        <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
          + Add blocker
        </button>
      </div>

      {/* Next Week Planning */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">🎯 Next Week's Focus Goals</h2>
        <div className="space-y-3">
          {nextWeekGoals.map((goal, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-blue-400 font-bold">{index + 1}.</span>
              <input
                type="text"
                value={goal}
                onChange={(e) => handleGoalChange(index, e.target.value)}
                placeholder={`Goal ${index + 1}...`}
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          ))}
        </div>
        <button
          onClick={saveGoals}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
        >
          Save Goals
        </button>
      </div>

      {/* Suggested Goals */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">💡 Suggested Goals</h2>
        <p className="text-gray-400 mb-3">Based on your notes and activity:</p>
        <div className="space-y-2">
          {allNotes.length > 0 && (
            <div className="text-sm text-gray-300">
              • Continue with your active projects: {allNotes.filter(note =>
                note.tags.some(tag => tag.startsWith('project-'))
              ).length > 0 ? 'Yes' : 'Consider starting a project'}
            </div>
          )}
          <div className="text-sm text-gray-300">
            • Maintain daily note-taking habit
          </div>
          <div className="text-sm text-gray-300">
            • Increase focus time by 2 hours this week
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;