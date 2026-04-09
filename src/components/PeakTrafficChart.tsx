"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import clsx from "clsx";
import { PeakTimes } from "../hooks/usePeakTimes";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const getCurrentHour = () => new Date().getHours();
const getCurrentDay = () => new Date().getDay();

interface Props {
  peakTimes: PeakTimes 
}

export default function PeakTrafficChart({
  peakTimes: {peakDaysOfWeek, peakHours}
}: Props) {
  const [view, setView] = useState<"hours" | "days">("hours");
  const [liveIndex, setLive] = useState<number>(getCurrentHour());
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const liveRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Update live index when view changes
  useEffect(() => {
    setLive(view === "hours" ? getCurrentHour() : getCurrentDay());
  }, [view]);

  // Update live index every minute
  useLayoutEffect(() => {
    const id = setInterval(() => {
      setLive(view === "hours" ? getCurrentHour() : getCurrentDay());
    }, 60_000);
    return () => clearInterval(id);
  }, [view]);

  // Prepare datasets
  const hoursData = Array.from({ length: 24 }, (_, h) => ({
    label: h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`,
    value: peakHours?.find((d) => d.hour === h)?.averageTickets || 0,
  }));

  const daysData = Array.from({ length: 7 }, (_, d) => ({
    label: dayNames[d],
    value: peakDaysOfWeek?.find((x) => x.day === d)?.averageTickets || 0,
  }));

  const chartData = view === "hours" ? hoursData : daysData;
  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  // GSAP animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const validBars = barsRef.current.filter(Boolean) as HTMLDivElement[];

      gsap.fromTo(
        validBars,
        { height: "0%" }, // Initial state
        {
          height: (i) => `${(chartData[i].value / maxValue) * 100}%`,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.03,
        }
      );

      if (liveRef.current) {
        gsap.to(liveRef.current, {
          xPercent: (liveIndex + 0.5) * (100 / chartData.length) - 50,
          duration: 0.6,
          ease: "power2.out",
        });
      }
    }, chartContainerRef);

    return () => ctx.revert();
  }, [chartData, liveIndex, maxValue]);

  // Auto-scroll to live indicator
  useLayoutEffect(() => {
    if (!liveRef.current || !chartRef.current) return;

    // Calculate scroll position
    const liveElement = liveRef.current;
    const container = chartRef.current;
    
    const scrollLeft = liveElement.offsetLeft - container.clientWidth / 2 + liveElement.clientWidth / 2;
    
    // Smooth scroll
    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth"
    });
  }, [liveIndex]); // Re-run when liveIndex changes

  return (
    <div ref={chartRef} className="relative bg-white dark:bg-black border-1 border-neutral-200 dark:border-neutral-800 rounded-xl p-3 w-full  overflow-x-auto scrollab  mx-auto">
      <div className="flex justify-between space-x-6 items-center mb-16 sticky left-0">
        <h2 className="text-xs text-gray-800 dark:text-gray-200">
          Peak {view === "hours" ? "Hours" : "Days"}
        </h2>
        <div className="flex space-x-2">
          {(["hours", "days"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer",
                view === v ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-900 text-gray-700"
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container - fixed height */}
      <div
        ref={chartContainerRef}
        className="relative flex items-end gap-x-1 h-40"
        style={{ 
  width: `${chartData.length * 50}px` // 50px per bar
}}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-gray-200 dark:border-gray-800 h-0" />
          ))}
        </div>
        {/* Live indicator */}
        <div
          ref={liveRef}
          className="absolute -top-10 flex flex-col items-center pointer-events-none z-20"
          style={{ left: `${(liveIndex + 0.5) * (100 / chartData.length)}%` }}
        >
          <div className="relative w-3 h-3 rounded-full bg-red-500 animate-pulse mb-0.5 ring-[8px] ring-red-500/15">
            <span className="absolute left-6 text-[10px] text-red-600 font-medium">
              Live
            </span>
          </div>
          <hr className="absolute top-28 rotate-90 w-40  border-t-neutral-500 border-dotted" />
        </div>

        {/* Bars */}
        {chartData.map((d, i) => (
          <div
            key={`${view}-${i}`}
            className="flex-1 h-full flex flex-col items-center justify-end group z-10" // Added h-full here
            style={{ width: "40px" }}
          >
            <div
              ref={(el) => {
                barsRef.current[i] = el;
              }}
              className={clsx(
                "w-3 rounded-lg bg-neutral-300 dark:bg-neutral-700 group-hover:bg-brand group-hover:cursor-pointer transition-colors",
                i === liveIndex && "bg-blue-600"
              )}
              style={{ height: "0%" }}
            />
            
            <div className="absolute bottom-full mb-1 px-2 py-1 text-xs bg-black text-white dark:bg-white dark:text-black rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {d.value} avarage tickets
            </div>
            <p className="text-xs mt-1 text-gray-700">{d.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
