export function formatMoney(number: number): string {
  return new Intl.NumberFormat().format(number);
}
export function camelCaseToTitle(text: string, reverse = false): string {
  if (reverse) {
    // Convert Title Case to camelCase
    return text
      .split(' ') // Split into words
      .filter(word => word.length > 0) // Remove empty strings from multiple spaces
      .map((word, index) => {
        if (index === 0) {
          // Lowercase entire first word
          return word.toLowerCase();
        }
        // Capitalize first letter, lowercase rest for subsequent words
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join('');
  }

  // Original camelCase to Title Case conversion
  return text
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .trim()
    .replace(/\w\S*/g, (word) => 
      word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
    );
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase() // Convert the string to lowercase
    .split(" ") // Split the string into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the words back into a single string
}

// Helper to parse '1h', '30m', etc. into seconds
export const parseExpiresIn = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // Default: 1 hour

  const amount = parseInt(match[1], 10);
  const unit = match[2] as "s" | "m" | "h" | "d";

  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 } as const;

  return amount * multiplier[unit];
};




export const letterFormatTotal = (num: number): string => {
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

// Utility to format dates as 'YYYY-MM-DD'
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Get date ranges for different periods
export const getDateRange = (period: "today" | "yesterday" | "thisWeek" | "thisMonth") => {
  const today = new Date();

  switch (period) {
    case "today":
      return {
        startDate: formatDate(today),
        endDate: formatDate(today),
      };

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return {
        startDate: formatDate(yesterday),
        endDate: formatDate(yesterday),
      };
    }

    case "thisWeek": {
      // Get Monday of the current week
      const day = today.getDay(); // 0 (Sunday) to 6 (Saturday)
      const diffToMonday = day === 0 ? 6 : day - 1; // Days to subtract to reach Monday
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday);

      // Get Sunday of the current week
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      return {
        startDate: formatDate(monday),
        endDate: formatDate(sunday),
      };
    }

    case "thisMonth": {
      // First day of the month
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Last day of the month
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
      };
    }

    default:
      throw new Error("Invalid period specified");
  }
};




/* Color Helpers  */
export function hexToRgb(hex: string) {
  const m = hex.replace('#', '').match(/.{1,2}/g)!;
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
}

export function rgbToHex({ r, g, b }: { r: number, g: number, b: number }) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function interpolate(c1: string, c2: string, t: number) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  return rgbToHex({
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t),
  });
}

export function getDonutShades(length: number, startColor: string, endColor: string, darkerShade: string) {
  return Array.from({ length }, (_, i) => {
      if (i === 0) return darkerShade;
      if (i === Math.floor(length / 2)) return startColor;
      const t = i / (length - 1);
      return interpolate(startColor, endColor, t);
  });
}
