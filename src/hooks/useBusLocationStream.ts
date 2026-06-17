import { useEffect, useRef, useState } from "react";

const telemetryUrl =
  import.meta.env.VITE_TELEMETRY_URL || "https://telemetry.katisha.online";

export interface TelemetryFix {
  lat: number;
  lon: number;
  ts: string;
}

export type StreamStatus =
  | "connecting"
  | "live"
  | "no_signal"
  | "no_tracker";

interface BusLocationStreamResult {
  position: TelemetryFix | null;
  status: StreamStatus;
}

/**
 * Opens a Server-Sent Events stream to the telemetry service for a given bus.
 * Requires `deviceId` to be truthy — if not, status is "no_tracker".
 */
export function useBusLocationStream(
  busId: string | undefined,
  deviceId: string | null | undefined,
): BusLocationStreamResult {
  const [position, setPosition] = useState<TelemetryFix | null>(null);
  const [status, setStatus] = useState<StreamStatus>(
    deviceId ? "connecting" : "no_tracker",
  );

  // Track the no-signal timeout
  const noSignalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // No tracker fitted
    if (!deviceId || !busId) {
      setStatus("no_tracker");
      setPosition(null);
      return;
    }

    setStatus("connecting");

    const url = `${telemetryUrl}/buses/${busId}/stream`;
    const es = new EventSource(url);

    const resetNoSignalTimer = () => {
      if (noSignalTimer.current) clearTimeout(noSignalTimer.current);
      // If no event arrives within 15 s, flip to "no_signal"
      noSignalTimer.current = setTimeout(() => {
        setStatus("no_signal");
      }, 15_000);
    };

    es.onopen = () => {
      setStatus("connecting");
      resetNoSignalTimer();
    };

    es.onmessage = (event) => {
      try {
        const fix: TelemetryFix = JSON.parse(event.data);
        if (
          typeof fix.lat === "number" &&
          typeof fix.lon === "number" &&
          fix.ts
        ) {
          setPosition(fix);
          setStatus("live");
          resetNoSignalTimer();
        }
      } catch {
        // malformed data — ignore
      }
    };

    es.onerror = () => {
      setStatus("no_signal");
    };

    return () => {
      es.close();
      if (noSignalTimer.current) clearTimeout(noSignalTimer.current);
    };
  }, [busId, deviceId]);

  return { position, status };
}
