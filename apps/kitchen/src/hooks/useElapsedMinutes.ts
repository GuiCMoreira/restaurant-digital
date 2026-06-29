"use client";

import { useEffect, useState } from "react";

function computeElapsedMinutes(createdAt: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
}

export function useElapsedMinutes(createdAt: string): number {
  const [minutes, setMinutes] = useState(() => computeElapsedMinutes(createdAt));

  useEffect(() => {
    setMinutes(computeElapsedMinutes(createdAt));
    const interval = setInterval(() => setMinutes(computeElapsedMinutes(createdAt)), 60000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return minutes;
}
