"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  /** Consequence reveals are not dismissible — the player must acknowledge them. */
  dismissible?: boolean;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
  /** "center" for dialogs, "right" for the admin side panel. */
  placement?: "center" | "right";
}

export function Modal({
  open,
  onClose,
  dismissible = true,
  children,
  className = "bg-surface",
  labelledBy,
  placement = "center",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose?.();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  const isRight = placement === "right";

  return (
    <div
      className={`fixed inset-0 z-50 flex ${
        isRight
          ? "justify-end"
          : "items-end justify-center p-0 sm:items-center sm:p-6"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
    >
      <div
        className="animate-fade absolute inset-0 bg-navy-950/55"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`animate-pop relative flex max-h-dvh w-full flex-col shadow-2xl outline-none ${
          isRight
            ? "h-dvh max-w-xl border-l border-line"
            : "max-w-lg rounded-t-2xl border border-line sm:rounded-2xl"
        } ${className}`}
      >
        {dismissible && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-2.5 top-2.5 z-10 grid h-11 w-11 place-items-center rounded-lg text-ink-muted transition hover:bg-canvas hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
