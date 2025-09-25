import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Plus } from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import { db } from '../utils/db';
import type { TimerPreset } from '../types';

const Timer: React.FC = () => {
  const [presets, setPresets] = useState<TimerPreset[]>([]);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customWork, setCustomWork] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);

  const {
    timeLeft,
    isRunning,
    isBreak,
    workDuration,
    breakDuration,
    start,
    pause,
    reset,
    toggleMode,
    setWorkDuration,
    setBreakDuration,
    formatTime,
  } = useTimer();

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const allPresets = await db.timerPresets.toArray();
      setPresets(allPresets);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  const saveCustomPreset = async () => {
    if (!customName.trim()) return;

    try {
      const newPreset = {
        name: customName.trim(),
        workTime: customWork,
        breakTime: customBreak,
      };

      await db.timerPresets.add(newPreset as TimerPreset);
      await loadPresets();
      setCustomName('');
      setCustomWork(25);
      setCustomBreak(5);
      setShowCustom(false);
    } catch (error) {
      console.error('Failed to save preset:', error);
    }
  };

  const loadPreset = (preset: TimerPreset) => {
    setWorkDuration(preset.workTime);
    setBreakDuration(preset.breakTime);
    reset();
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);


  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Timer</h1>

      {/* Current Timer */}
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <div className="text-sm text-gray-400 mb-2">
          {isBreak ? 'Break Time' : 'Focus Session'}
        </div>
        <div className="text-6xl font-mono font-bold mb-6">
          {formatTime(timeLeft)}
        </div>
        <div className="flex justify-center space-x-4 mb-6">
          {!isRunning ? (
            <button
              onClick={start}
              className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg flex items-center space-x-2 transition-colors text-lg"
            >
              <Play className="w-6 h-6" />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={pause}
              className="bg-yellow-600 hover:bg-yellow-700 px-8 py-4 rounded-lg flex items-center space-x-2 transition-colors text-lg"
            >
              <Pause className="w-6 h-6" />
              <span>Pause</span>
            </button>
          )}
          <button
            onClick={reset}
            className="bg-gray-600 hover:bg-gray-700 px-8 py-4 rounded-lg flex items-center space-x-2 transition-colors text-lg"
          >
            <RotateCcw className="w-6 h-6" />
            <span>Reset</span>
          </button>
        </div>
        <button
          onClick={toggleMode}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded transition-colors"
        >
          Switch to {isBreak ? 'Work' : 'Break'}
        </button>
      </div>

      {/* Timer Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Timer Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Work Duration (min)</label>
            <input
              type="number"
              value={workDuration}
              onChange={(e) => setWorkDuration(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              min="1"
              max="120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Break Duration (min)</label>
            <input
              type="number"
              value={breakDuration}
              onChange={(e) => setBreakDuration(Number(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              min="1"
              max="60"
            />
          </div>
        </div>
      </div>

      {/* Custom Presets */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Custom Timers</h2>
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom</span>
          </button>
        </div>

        {showCustom && (
          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Timer name"
                className="bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                value={customWork}
                onChange={(e) => setCustomWork(Number(e.target.value))}
                placeholder="Work (min)"
                className="bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                min="1"
              />
              <input
                type="number"
                value={customBreak}
                onChange={(e) => setCustomBreak(Number(e.target.value))}
                placeholder="Break (min)"
                className="bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                min="1"
              />
            </div>
            <button
              onClick={saveCustomPreset}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
            >
              Save Preset
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {presets.map(preset => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset)}
              className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold">{preset.name}</div>
              <div className="text-sm text-gray-400">
                Work: {preset.workTime}min | Break: {preset.breakTime}min
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timer;