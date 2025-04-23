export function formatMoney(number: number): string {
  return new Intl.NumberFormat().format(number);
}
export function camelCaseToTitle(text: string): string {
  // Insert a space before all uppercase letters
  // Then capitalize the first letter of each word
  return (
    text
      // Add space before uppercase letters
      .replace(/([A-Z])/g, " $1")
      // Trim any leading/trailing spaces
      .trim()
      // Capitalize the first letter of each word
      .replace(
        /\w\S*/g,
        (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
      )
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
const parseExpiresIn = (expiresIn: string): number => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 3600; // Default: 1 hour

  const amount = parseInt(match[1], 10);
  const unit = match[2] as "s" | "m" | "h" | "d";

  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 } as const;

  return amount * multiplier[unit];
};

// Base64url encoding (for JWT)
const base64UrlEncode = (obj: object): string => {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

// Fake JWT generator
export const generateFakeJWT = (
  payload: object = {},
  expiresIn: string = "1h"
): string => {
  const header = { alg: "HS256", typ: "JWT" };
  const expSeconds = parseExpiresIn(expiresIn);
  const exp = Math.floor(Date.now() / 1000) + expSeconds;

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode({ ...payload, exp });

  const signature = "mocked-signature";

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

