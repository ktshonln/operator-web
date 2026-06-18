'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { gsap } from 'gsap';
import { AiOutlineClose } from 'react-icons/ai';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export type DatePickerMode = 'single' | 'range' | 'mixed' | 'time';

interface CustomDatePickerProps {
  mode?: DatePickerMode;
  withTime?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onChange: (value: Date | [Date, Date] | null) => void;
}

function CustomDatePicker({
  mode = 'single',
  withTime = false,
  isOpen = false,
  onClose,
  onChange
}: CustomDatePickerProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [time, setTime] = useState({ hours: 0, minutes: 0 });
  const [mixedTab, setMixedTab] = useState<'single' | 'range'>('single');
  const [shouldRender, setShouldRender] = useState(isOpen);
  const prevOpenRef = useRef(isOpen);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveMode = mode === 'mixed' ? mixedTab : mode;
  const showCalendar = effectiveMode !== 'time';

  const days = useMemo(() => {
    if (effectiveMode === 'time') return [];
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentDate)),
      end: endOfWeek(endOfMonth(currentDate))
    });
  }, [currentDate, effectiveMode]);

  useEffect(() => {
    const prev = prevOpenRef.current;
    prevOpenRef.current = isOpen;

    if (isOpen && !prev) {
      setShouldRender(true);
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }

    if (!isOpen && prev) {
      gsap.to(containerRef.current, {
        opacity: 0,
        y: 5,
        scale: 0.98,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => setShouldRender(false)
      });
    }
  }, [isOpen]);

  const handleTimeChange = (type: 'hours' | 'minutes', val: number) => {
    const clamped = Math.min(Math.max(val, 0), type === 'hours' ? 23 : 59);
    const nxt = { ...time, [type]: clamped };
    setTime(nxt);
  
    if (effectiveMode === 'time') {
      const d = new Date();
      d.setHours(nxt.hours, nxt.minutes);
      onChange(d);
    }
  
    if (withTime && startDate) {
      const updated = new Date(startDate);
      updated.setHours(nxt.hours, nxt.minutes);
      setStartDate(updated);
    }
  
    if (withTime && endDate) {
      const updated = new Date(endDate);
      updated.setHours(nxt.hours, nxt.minutes);
      setEndDate(updated);
    }
  };

  const applyTimeToDate = (date: Date) => {
    const clone = new Date(date);
    if (withTime) {
      clone.setHours(time.hours, time.minutes, 0, 0);
    } else {
      clone.setHours(0, 0, 0, 0);
    }
    return clone;
  };

  const handleDateClick = (date: Date) => {
    if (effectiveMode === 'time') return;
    const selected = applyTimeToDate(date);

    if (effectiveMode === 'range') {
      if (!startDate || (startDate && endDate)) {
        setStartDate(selected);
        setEndDate(null);
      } else if (selected > startDate) {
        setEndDate(selected);
      } else {
        // If clicking a date before start date, restart the range
        setStartDate(selected);
        setEndDate(null);
      }
    } else {
      setStartDate(selected);
      setEndDate(null);
    }
  };

  const handleConfirm = () => {
    if (effectiveMode === 'range' && startDate && endDate) {
      onChange([startDate, endDate]);
    } else if (effectiveMode === 'single' && startDate) {
      onChange(startDate);
    } else if (effectiveMode === 'time') {
      const d = new Date();
      d.setHours(time.hours, time.minutes, 0, 0);
      onChange(d);
    }
    onClose?.();
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    onChange(null);
  };

  const summary = (() => {
    if (effectiveMode === 'time') {
      return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`;
    }
    if (startDate && endDate) {
      return `${format(startDate, 'MMM d')}${withTime ? ` ${format(startDate, 'HH:mm')}` : ''} - ${format(endDate, 'MMM d')}${withTime ? ` ${format(endDate, 'HH:mm')}` : ''}`;
    }
    if (startDate) {
      return `${format(startDate, 'MMM d, yyyy')}${withTime ? ` ${format(startDate, 'HH:mm')}` : ''}`;
    }
    return 'No date selected';
  })();

  if (!shouldRender) return null;

  return (
    <div ref={containerRef} className="relative bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl shadow-2xl w-[340px] font-sans z-50">
      {/* Top Header & Modes */}
      <div className="flex items-center justify-between mb-4">
        {mode === 'mixed' ? (
          <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            <button 
              type='button' 
              className={`text-xs font-medium px-4 py-1.5 rounded-md transition-colors ${mixedTab === 'single' ? 'bg-white dark:bg-neutral-700 shadow-sm text-brand' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`} 
              onClick={() => setMixedTab('single')}
            >
              Single
            </button>
            <button 
              type='button' 
              className={`text-xs font-medium px-4 py-1.5 rounded-md transition-colors ${mixedTab === 'range' ? 'bg-white dark:bg-neutral-700 shadow-sm text-brand' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`} 
              onClick={() => setMixedTab('range')}
            >
              Range
            </button>
          </div>
        ) : (
          <div className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
            {mode === 'range' ? 'Select Date Range' : 'Select Date'}
          </div>
        )}
        <button type="button" onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <AiOutlineClose size={16} />
        </button>
      </div>

      <div className="text-center font-medium text-[15px] mb-4 text-brand dark:text-brand bg-brand/5 dark:bg-brand/10 py-2 rounded-lg">
        {summary}
      </div>

      {showCalendar && (
        <div className="mb-2">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-4 px-2">
            <button type='button' onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <FiChevronLeft size={18} className="text-neutral-600 dark:text-neutral-300" />
            </button>
            <div className="font-semibold text-sm">{format(currentDate, 'MMMM yyyy')}</div>
            <button type='button' onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
              <FiChevronRight size={18} className="text-neutral-600 dark:text-neutral-300" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 text-[11px] font-semibold text-center mb-2 text-neutral-400 uppercase tracking-wider">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 justify-items-center">
            {days.map(dt => {
              const inMonth = isSameMonth(dt, currentDate);
              const isStart = startDate && isSameDay(dt, startDate);
              const isEnd = endDate && isSameDay(dt, endDate);
              const inRange = startDate && endDate && dt > startDate && dt < endDate;
              const isToday = isSameDay(dt, new Date());

              // Determine classes for styling
              let wrapperClass = "w-full h-8 flex items-center justify-center relative ";
              if (effectiveMode === 'range' && startDate && endDate) {
                if (inRange) wrapperClass += "bg-brand/10 dark:bg-brand/20 ";
                if (isStart) wrapperClass += "bg-gradient-to-r from-transparent to-brand/10 dark:to-brand/20 ";
                if (isEnd) wrapperClass += "bg-gradient-to-l from-transparent to-brand/10 dark:to-brand/20 ";
              }

              let btnClass = "w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-medium transition-all focus:outline-none ";
              
              if (isStart || isEnd) {
                btnClass += "bg-brand text-white shadow-md z-10 ";
              } else if (!inMonth) {
                btnClass += "text-neutral-300 dark:text-neutral-600 ";
              } else if (inRange) {
                btnClass += "text-brand font-semibold ";
              } else if (isToday) {
                btnClass += "bg-neutral-100 dark:bg-neutral-800 text-brand ";
              } else {
                btnClass += "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 ";
              }

              return (
                <div key={dt.toISOString()} className={wrapperClass}>
                  <button
                    type='button'
                    onClick={() => handleDateClick(dt)}
                    className={btnClass}
                  >
                    {format(dt, 'd')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time Picker */}
      {withTime && (
        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <span className="text-sm font-medium text-neutral-500">Time:</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={23}
              value={time.hours}
              onChange={e => handleTimeChange('hours', parseInt(e.target.value) || 0)}
              className="w-12 h-8 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-md text-center text-sm font-medium focus:ring-2 focus:ring-brand focus:border-brand outline-none"
            />
            <span className="font-bold text-neutral-400">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={time.minutes}
              onChange={e => handleTimeChange('minutes', parseInt(e.target.value) || 0)}
              className="w-12 h-8 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 rounded-md text-center text-sm font-medium focus:ring-2 focus:ring-brand focus:border-brand outline-none"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <button type='button' onClick={handleClear} className="text-neutral-500 hover:text-red-500 dark:hover:text-red-400 text-sm font-medium transition-colors">Clear</button>
        <button type='button' onClick={handleConfirm} className="bg-brand text-white text-sm font-medium px-5 py-2 rounded-lg hover:brightness-95 shadow-sm transition-all active:scale-95">Apply</button>
      </div>
    </div>
  );
}

export default CustomDatePicker;
