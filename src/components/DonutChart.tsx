 import React, { useEffect, useState } from 'react';
import { getDonutShades, letterFormatTotal } from '../utils/helpers';
import { RevenueAnalytics } from '../hooks/useRevenueAnalytics';

interface DonutProps {
    values: RevenueAnalytics[] ;           // your data
    size?: number;              // diameter in px (default: 200)
    thickness?: number;         // colored stroke width in px (default: 20)
    borderWidth?: number;       // white border width in px (default: 5)
    startColor?: string;        // the middle color that you want
    darkerShade?: string;        // Darker shade of middle color (default: '#123450')
    endColor?: string;          // lightest shade (default: '#D3D3D3')
    totalLabel?: string;        // label above the number (default: 'Total')
    currency?: string;          // currency/text prefix (default: 'RWF')
    totalValue?: string;        // optional override for displayed total
}

const DonutChart: React.FC<DonutProps> = ({
    values,
    size = 150,
    thickness = 20,
    borderWidth = 2,
    startColor = '#2E82C8',
    darkerShade = '#123450',
    endColor = '#D3D3D3',
    totalLabel = 'Total',
    currency = 'RWF',
    totalValue,
}) => {
    const [isMounted, setIsMounted] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    
   // Re-trigger animation when valid values arrive
useEffect(() => {
    if (values.length > 0) {
        // Timeout helps trigger transitions cleanly
        const t = setTimeout(() => setIsMounted(true), 50);
        return () => clearTimeout(t);
    } else {
        setIsMounted(false); // Reset animation flag if values are empty
    }
}, [values]);

    // Compute shades
    const shades = getDonutShades(values.length, startColor, endColor, darkerShade)


    // Compute geometry
    const sum = values.reduce((s, v) => s + Number(v.revenue??0), 0);
    const total = sum || 1; // Prevent division by zero
    const fullStroke = thickness + borderWidth * 2;
    const radius = (size - fullStroke) / 2;
    const circumference = 2 * Math.PI * radius;

    // Compute slice angles
    let cumulative = 0;
    const circles: React.ReactNode[] = [];

    values.forEach((v, i) => {
        const revenue = Number(v.revenue);
        const segLen = (revenue / total) * circumference;
        const dashArray = `${segLen} ${circumference - segLen}`;
        const dashOffset = -circumference * 0.25 - cumulative;
        cumulative += segLen;

        const handleMouseMove = (e: React.MouseEvent) => {
            const rect = (e.target as SVGCircleElement).getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        };

        // White border
        circles.push(
            <circle
                key={`border-${i}`}
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                className='stroke-white dark:stroke-black'
                strokeWidth={fullStroke}
                strokeLinecap="round"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                style={{
                    transition: 'all 1s ease-out',
                    strokeDasharray: isMounted ? dashArray : `0 ${circumference}`,
                    strokeDashoffset: isMounted ? dashOffset : circumference
                }}
            />
        );

        // Colored slice
        circles.push(
            <circle
            onMouseEnter={()=>setHoveredIndex(i)}
            onMouseLeave={()=>setHoveredIndex(null)}
            onMouseMove={handleMouseMove}
                key={`color-${i}`}
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                stroke={shades[i]}
                strokeWidth={thickness}
                strokeLinecap="round"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                style={{
                    transition: 'all 1s ease-out',
                    strokeDasharray: isMounted ? dashArray : `0 ${circumference}`,
                    strokeDashoffset: isMounted ? dashOffset : circumference,
                    cursor: 'pointer'
                }}
            />
        );
    });

    const displayedTotalValue = totalValue || letterFormatTotal(sum);

    return (
        <div
            className="relative bg-white text-black dark:bg-black dark:text-white rounded-full"
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size} >
                {circles}
            </svg>
             {/* Tooltip */}
             {hoveredIndex !== null && (
                <div
                    className="absolute text-xs px-2 py-1 rounded bg-black text-white dark:bg-white dark:text-black shadow pointer-events-none"
                    style={{
                        left: mousePos.x,
                        top: mousePos.y,
                        transform: 'translate(-50%, -120%)',
                        whiteSpace: 'nowrap',
                        zIndex: 50,
                    }}
                >
                    <div className="font-bold">{values[hoveredIndex].routeName}</div>
                    <div>{currency} {letterFormatTotal(Number(values[hoveredIndex].revenue??0))}</div>
                </div>
            )}
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
            style={{
                opacity: isMounted ? 1 : 0,
                transform: `scale(${isMounted ? 1 : 0.8})`,
                transition: 'all 0.5s ease-out 0.2s'
            }}>
                <span className="text-xs">{totalLabel}</span>
                <div className="flex items-center">
                    <span className="text-neutral-500 text-xs font-bold mr-1">{currency}</span>
                    <span className="text-2xl font-bold">{displayedTotalValue}</span>
                </div>
            </div>
        </div>
    );
};

export default DonutChart