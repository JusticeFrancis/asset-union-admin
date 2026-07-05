"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

export type RowOptionItem = {
  key: string;
  label: string;
  iconSrc: string;
  onClick?: () => void;
};

type RowOptionsDropdownProps = {
  options: RowOptionItem[];
  align?: "left" | "right";
  className?: string;
  menuWidth?: number;
  triggerIconSrc?: string;
};

export function RowOptionsDropdown({
  options,
  align = "right",
  className,
  menuWidth = 172,
  triggerIconSrc,
}: RowOptionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuTop, setMenuTop] = useState(0);
  const [menuLeft, setMenuLeft] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuHeight = useMemo(() => options.length * 41 + 24, [options.length]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      const isInsideTrigger = wrapperRef.current?.contains(target);
      const isInsideMenu = menuRef.current?.contains(target);

      if (!isInsideTrigger && !isInsideMenu) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    function updatePosition() {
      const trigger = triggerRef.current;
      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const gap = 8;
      const viewportPadding = 8;

      let nextTop = rect.bottom + gap;
      if (nextTop + menuHeight > window.innerHeight - viewportPadding) {
        nextTop = Math.max(viewportPadding, rect.top - menuHeight - gap);
      }

      const defaultLeft =
        align === "right" ? rect.right - menuWidth : rect.left;
      const boundedLeft = Math.min(
        Math.max(viewportPadding, defaultLeft),
        window.innerWidth - menuWidth - viewportPadding,
      );

      setMenuTop(nextTop);
      setMenuLeft(boundedLeft);
    }

    if (isOpen) {
      updatePosition();
      window.addEventListener("mousedown", handleOutsideClick);
      window.addEventListener("keydown", handleEscape);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [align, isOpen, menuHeight, menuWidth]);

  const menu = isOpen ? (
    <div
      className="fixed z-50 overflow-hidden rounded-[16px] border border-[#E5E5E5] bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.10),0_2px_6px_rgba(0,0,0,0.11)]"
      ref={menuRef}
      role="menu"
      style={{
        left: `${menuLeft}px`,
        top: `${menuTop}px`,
        width: `${menuWidth}px`,
      }}
    >
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <div className="flex flex-col gap-2" key={option.key}>
            <button
              className="flex w-full items-center gap-2 px-3 text-left text-[12px] font-light text-[#050a0e]"
              onClick={() => {
                option.onClick?.();
                setIsOpen(false);
              }}
              role="menuitem"
              type="button"
            >
              <img
                alt=""
                aria-hidden="true"
                className="size-4 shrink-0 object-contain"
                src={option.iconSrc}
              />
              {option.label}
            </button>
            {index !== options.length - 1 ? (
              <div className="h-px w-full bg-[#ededed]" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className="flex size-5 items-center justify-center"
        onClick={() => setIsOpen((prev) => !prev)}
        ref={triggerRef}
        type="button"
      >
        <img
          alt=""
          aria-hidden="true"
          className="size-3.5 object-contain"
          src={triggerIconSrc}
        />
      </button>
      {mounted ? createPortal(menu, document.body) : null}
    </div>
  );
}
