"use client";

import { useEffect } from "react";
import { clearDemoData } from "@/lib/state/demoStorage";

declare global {
  interface Window {
    shieldquestDemo?: { reset: () => void };
  }
}

/**
 * Renders nothing. Exposes `shieldquestDemo.reset()` in the browser console so
 * the prototype can be returned to its fixture state between run-throughs
 * without a visible control on any player screen.
 */
export function DemoConsole() {
  useEffect(() => {
    window.shieldquestDemo = {
      reset: () => {
        clearDemoData();
        window.location.reload();
      },
    };
    return () => {
      delete window.shieldquestDemo;
    };
  }, []);

  return null;
}
