 import React, { useEffect, useState } from 'react';

interface DonutProps {
    values: number[];           // your data
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
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Helpers to interpolate hex colors
    const hexToRgb = (hex: string) => {
        const m = hex.replace('#', '').match(/.{1,2}/g)!;
        return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
    };
    const rgbToHex = ({ r, g, b }: { r: number, g: number, b: number }) =>
        '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    const interpolate = (c1: string, c2: string, t: number) => {
        const a = hexToRgb(c1), b = hexToRgb(c2);
        return rgbToHex({
            r: Math.round(a.r + (b.r - a.r) * t),
            g: Math.round(a.g + (b.g - a.g) * t),
            b: Math.round(a.b + (b.b - a.b) * t),
        });
    };

    // Compute shades
    const shades = values.map((_, i) => {
        if (i === 0) {
            return darkerShade; // First slice is darker shade
        } else if (i === Math.floor(values.length / 2)) {
            return startColor; // Middle slice is start color
        } else {
            const t = i / (values.length - 1);
            return interpolate(startColor, endColor, t);
        }
    });


    // Compute geometry
    const sum = values.reduce((s, v) => s + v, 0);
    const total = sum || 1; // Prevent division by zero
    const fullStroke = thickness + borderWidth * 2;
    const radius = (size - fullStroke) / 2;
    const circumference = 2 * Math.PI * radius;

    // Compute slice angles
    let cumulative = 0;
    const circles: React.ReactNode[] = [];

    values.forEach((v, i) => {
        const segLen = (v / total) * circumference;
        const dashArray = `${segLen} ${circumference - segLen}`;
        const dashOffset = -circumference * 0.25 - cumulative;
        cumulative += segLen;

        // White border
        circles.push(
            <circle
                key={`border-${i}`}
                cx={size / 2} cy={size / 2} r={radius}
                fill="none"
                stroke="white"
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
                    strokeDashoffset: isMounted ? dashOffset : circumference
                }}
            />
        );
    });

    const formatTotal = (num: number): string => {
        if (num >= 1000000000) {
            const value = num / 1000000000;
            return value % 1 === 0 ? `${value}B` : `${value.toFixed(2)}B`;
        }
        if (num >= 1000000) {
            const value = num / 1000000;
            return value % 1 === 0 ? `${value}M` : `${value.toFixed(2)}M`;
        }
        if (num >= 1000) {
            const value = num / 1000;
            return value % 1 === 0 ? `${value}K` : `${value.toFixed(2)}K`;
        }
        return num.toString();
    };

    const displayedTotalValue = totalValue || formatTotal(sum);

    return (
        <div
            className="relative bg-white rounded-full"
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size}>
                {circles}
            </svg>
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