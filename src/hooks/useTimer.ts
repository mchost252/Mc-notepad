import { useState, useEffect, useRef } from 'react';

export interface TimerState {
  timeLeft: number; // in seconds
  isRunning: boolean;
  isBreak: boolean;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
}

export const useTimer = (workDuration = 25, breakDuration = 5) => {
  const [state, setState] = useState<TimerState>({
    timeLeft: workDuration * 60,
    isRunning: false,
    isBreak: false,
    workDuration,
    breakDuration,
  });

  const intervalRef = useRef<number | null>(null);
  const notificationRef = useRef<Notification | null>(null);

  useEffect(() => {
    if (state.isRunning && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.timeLeft]);

  useEffect(() => {
    if (state.timeLeft === 0) {
      // Timer finished
      showNotification();
      toggleMode();
    }
  }, [state.timeLeft]);

  const showNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const message = state.isBreak ? 'Break time is over! Back to work.' : 'Work session complete! Take a break.';
      notificationRef.current = new Notification('Timer Complete', {
        body: message,
        icon: '/icon-192.png',
      });
    }
  };

  const start = () => {
    setState(prev => ({ ...prev, isRunning: true }));
  };

  const pause = () => {
    setState(prev => ({ ...prev, isRunning: false }));
  };

  const reset = () => {
    setState(prev => ({
      ...prev,
      timeLeft: prev.isBreak ? prev.breakDuration * 60 : prev.workDuration * 60,
      isRunning: false,
    }));
  };

  const toggleMode = () => {
    setState(prev => ({
      ...prev,
      isBreak: !prev.isBreak,
      timeLeft: prev.isBreak ? prev.workDuration * 60 : prev.breakDuration * 60,
      isRunning: false,
    }));
  };

  const setWorkDuration = (minutes: number) => {
    setState(prev => ({
      ...prev,
      workDuration: minutes,
      timeLeft: prev.isBreak ? prev.timeLeft : minutes * 60,
    }));
  };

  const setBreakDuration = (minutes: number) => {
    setState(prev => ({
      ...prev,
      breakDuration: minutes,
      timeLeft: prev.isBreak ? minutes * 60 : prev.timeLeft,
    }));
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    ...state,
    start,
    pause,
    reset,
    toggleMode,
    setWorkDuration,
    setBreakDuration,
    formatTime,
  };
};