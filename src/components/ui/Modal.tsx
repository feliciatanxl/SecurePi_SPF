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
  /**
   * Sizing variant: default (max-w-lg), wide (max-w-2xl for the About modal) or
   * form — a centred working dialog wide enough for two-column form rows.
   */
  size?: "default" | "wide" | "form";
}

export function Modal({
  open,
  onClose,
  dismissible = true,
  children,
  className = "bg-surface",
  labelledBy,
  placement = "center",
  size = "default",
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
        className={`animate-pop relative flex w-full flex-col shadow-2xl outline-none ${
          isRight
            // 480px: wide enough for the scenario detail panel, narrow enough
            // that the portal behind it stays readable rather than replaced.
            ? "h-dvh max-h-dvh max-w-[480px] border-l border-line"
            : size === "form"
              /*
                A working dialog rather than a message: wide enough for the
                two-column form rows to stay two columns, and short enough that
                the portal is still visible around it, so it reads as a task
                inside the tool. On a phone it stays a near-full-height bottom
                sheet, because 900px of dialog on a 390px screen is a page.
              */
              ? "max-h-[92dvh] rounded-t-2xl border border-line sm:max-h-[88dvh] sm:max-w-[900px] sm:rounded-2xl lg:max-w-[960px]"
              : size === "wide"
                ? "max-h-dvh max-w-2xl rounded-t-2xl border border-line sm:rounded-2xl"
                : "max-h-dvh max-w-lg rounded-t-2xl border border-line sm:rounded-2xl"
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
