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
  subMonths
} from 'date-fns';
import { gsap } from 'gsap';

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
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    });
  }, [currentDate, effectiveMode]);

  useEffect(() => {
    const prev = prevOpenRef.current;
    prevOpenRef.current = isOpen;

    if (isOpen && !prev) {
      setShouldRender(true);
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' }
      );
    }

    if (!isOpen && prev) {
      gsap.to(containerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.3,
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
      return `${format(startDate, 'dd MMM yyyy')}${withTime ? ` ${format(startDate, 'HH:mm')}` : ''} → ${format(endDate, 'dd MMM yyyy')}${withTime ? ` ${format(endDate, 'HH:mm')}` : ''}`;
    }
    if (startDate) {
      return `${format(startDate, 'dd MMM yyyy')}${withTime ? ` ${format(startDate, 'HH:mm')}` : ''}`;
    }
    return 'No selection';
  })();

  if (!shouldRender) return null;

  return (
    <div ref={containerRef} className="bg-white p-5 rounded-xl shadow-xl w-80 space-y-4">
      {mode === 'mixed' && (
        <div className="flex justify-center gap-2">
          <button className={`${mixedTab === 'single' ? 'bg-blue-500 text-white' : 'bg-gray-200'} px-3 py-1 rounded`} onClick={() => setMixedTab('single')}>Single</button>
          <button className={`${mixedTab === 'range' ? 'bg-blue-500 text-white' : 'bg-gray-200'} px-3 py-1 rounded`} onClick={() => setMixedTab('range')}>Range</button>
        </div>
      )}

      <div className="text-center text-sm text-gray-600">{summary}</div>

      {showCalendar && (
        <>
          <div className="flex justify-between items-center">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>←</button>
            <div className="font-semibold">{format(currentDate, 'MMMM yyyy')}</div>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>→</button>
          </div>

          <div className="grid grid-cols-7 text-xs text-center mt-2 text-gray-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map(dt => {
              const inMonth = isSameMonth(dt, currentDate);
              const isStart = startDate && isSameDay(dt, startDate);
              const isEnd = endDate && isSameDay(dt, endDate);
              const inRange = startDate && endDate && dt > startDate && dt < endDate;

              return (
                <button
                  key={dt.toISOString()}
                  onClick={() => handleDateClick(dt)}
                  disabled={!inMonth}
                  className={`p-2 text-xs rounded ${inMonth ? 'hover:bg-blue-100' : 'text-gray-300'} ${isStart || isEnd ? 'bg-blue-500 text-white' : ''} ${inRange ? 'bg-blue-100' : ''}`}
                >
                  {format(dt, 'd')}
                </button>
              );
            })}
          </div>
        </>
      )}

      {withTime && (
        <div className="flex justify-center gap-2 mt-3">
          <input
            type="number"
            min={0}
            max={23}
            value={time.hours}
            onChange={e => handleTimeChange('hours', parseInt(e.target.value) || 0)}
            className="w-14 border rounded p-1 text-center"
          />
          <span>:</span>
          <input
            type="number"
            min={0}
            max={59}
            value={time.minutes}
            onChange={e => handleTimeChange('minutes', parseInt(e.target.value) || 0)}
            className="w-14 border rounded p-1 text-center"
          />
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <button onClick={handleClear} className="text-red-500 text-sm hover:underline">Clear</button>
        <button onClick={handleConfirm} className="bg-blue-500 text-white text-sm px-4 py-2 rounded hover:bg-blue-600">Confirm</button>
      </div>
    </div>
  );
}

export default CustomDatePicker;

// DEMO USAGE
export function DatePickerDemo() {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState<Date | [Date, Date] | null>(null);

  const displayValue = () => {
    if (!val) return 'Nothing selected';
    if (val instanceof Date) return format(val, 'PPpp');
    return `${format(val[0], 'PPpp')} → ${format(val[1], 'PPpp')}`;
  };

  return (
    <div className="p-6">
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Open Picker
      </button>

      {open && (
        <CustomDatePicker
          mode="mixed"
          withTime={true}
          isOpen={open}
          onClose={() => setOpen(false)}
          onChange={setVal}
        />
      )}

      <div className="mt-4 text-sm text-gray-700">
        <strong>Current Selection:</strong> {displayValue()}
      </div>
    </div>
  );
}
