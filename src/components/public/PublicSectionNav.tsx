"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";

export const PUBLIC_NAV_ITEMS: { label: string; href: string; id: string }[] = [
  { label: "About", href: "#about", id: "about" },
  { label: "How it works", href: "#how-it-works", id: "how-it-works" },
  { label: "Guardians", href: "#guardians", id: "guardians" },
  { label: "What it covers", href: "#coverage", id: "coverage" },
  { label: "Districts", href: "#districts", id: "districts" },
  { label: "Evidence-informed", href: "#evidence", id: "evidence" },
  { label: "Responsible design", href: "#responsible-design", id: "responsible-design" },
];

export function PublicSectionNav() {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const sectionElements = PUBLIC_NAV_ITEMS.map((item) =>
      document.getElementById(item.id),
    ).filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible sections
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          // Sort by proximity to top of viewport
          const topMost = visible.sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top),
          )[0];
          if (topMost?.target.id) {
            setActiveId(topMost.target.id);
          }
        }
      },
      {
        rootMargin: "-15% 0px -65% 0px",
        threshold: [0, 0.2, 0.5, 0.8],
      },
    );

    sectionElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Close on Escape key press and return focus to trigger
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close when clicking outside dropdown and trigger
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    const targetId = href.replace("#", "");
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    e.preventDefault();
    const isReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.motion === "reduced";

    targetEl.scrollIntoView({
      behavior: isReduced ? "instant" : "smooth",
      block: "start",
    });

    setActiveId(targetId);
    window.history.pushState(null, "", href);
  };

  const handleMobileItemClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsOpen(false);
    handleClick(e, href);
  };

  return (
    <>
      {/* Desktop navigation bar */}
      <nav aria-label="Public website" className="ml-auto hidden lg:block">
        <ul className="flex items-center gap-1.5 text-[12px] font-bold text-white/75">
          {PUBLIC_NAV_ITEMS.map(({ label, href, id }) => {
            const isActive = activeId === id;
            return (
              <li key={href}>
                <a
                  href={href}
                  ref={(el) => {
                    itemRefs.current[id] = el;
                  }}
                  onClick={(e) => handleClick(e, href)}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-xl px-3 transition-all duration-200 ${
                    isActive
                      ? "bg-civic-500/20 text-white ring-1 ring-civic-400 shadow-[0_0_12px_-2px_rgba(95,160,232,0.4)]"
                      : "hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile/tablet hamburger trigger */}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="public-mobile-nav"
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
        onClick={() => setIsOpen((prev) => !prev)}
        className="ml-auto grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/18 bg-white/8 text-white transition hover:bg-white/14 focus-visible:ring-2 focus-visible:ring-civic-400 lg:hidden"
      >
        {isOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      {/* Mobile/tablet full-width dropdown panel */}
      {isOpen && (
        <div
          id="public-mobile-nav"
          ref={dropdownRef}
          className="absolute inset-x-0 top-full border-b border-white/12 bg-navy-950/98 px-4 py-3 shadow-2xl backdrop-blur-2xl lg:hidden"
        >
          <nav aria-label="Public mobile navigation" className="mx-auto max-w-[1180px]">
            <ul className="flex flex-col gap-1">
              {PUBLIC_NAV_ITEMS.map(({ label, href, id }) => {
                const isActive = activeId === id;
                return (
                  <li key={`mobile-${href}`}>
                    <a
                      href={href}
                      onClick={(e) => handleMobileItemClick(e, href)}
                      aria-current={isActive ? "true" : undefined}
                      className={`flex min-h-[48px] items-center rounded-xl px-4 text-[14px] font-bold transition-all duration-150 ${
                        isActive
                          ? "bg-civic-500/20 text-white ring-1 ring-civic-400 shadow-[0_0_12px_-2px_rgba(95,160,232,0.4)]"
                          : "text-white/80 hover:bg-white/8 hover:text-white"
                      }`}
                    >
                      {label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
