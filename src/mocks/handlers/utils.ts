import { parseExpiresIn } from "../../utils/helpers";


export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
  