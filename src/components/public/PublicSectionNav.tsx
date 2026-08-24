"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

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
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const mobileNavRef = useRef<HTMLDivElement>(null);

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

  // Scroll active item into view on mobile navigation strip
  useEffect(() => {
    if (!activeId) return;
    const isReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.motion === "reduced";

    const activeLink = itemRefs.current[activeId];
    if (activeLink && mobileNavRef.current) {
      activeLink.scrollIntoView({
        behavior: isReduced ? "instant" : "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeId]);

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

      {/* Mobile/tablet secondary navigation strip */}
      <div
        ref={mobileNavRef}
        className="w-full overflow-x-auto overscroll-x-contain border-t border-white/10 px-4 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:hidden"
      >
        <ul className="flex items-center gap-1.5 whitespace-nowrap text-[12px] font-bold text-white/75">
          {PUBLIC_NAV_ITEMS.map(({ label, href, id }) => {
            const isActive = activeId === id;
            return (
              <li key={`mobile-${href}`} className="shrink-0">
                <a
                  href={href}
                  ref={(el) => {
                    if (!itemRefs.current[id]) {
                      itemRefs.current[id] = el;
                    }
                  }}
                  onClick={(e) => handleClick(e, href)}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex min-h-[40px] items-center rounded-xl px-3 transition-all duration-200 ${
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
      </div>
    </>
  );
}
