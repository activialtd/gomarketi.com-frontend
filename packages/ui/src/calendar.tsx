"use client";

import { DayPicker, type DayPickerProps } from "react-day-picker";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { cn } from "./utils";

export type CalendarProps = DayPickerProps & {
  className?: string;
};

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 select-none", className)}
      classNames={{
        // ── Month layout ──────────────────────────────────
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center items-center relative",
        caption_label: "text-[13px] font-bold text-[#1C1C1C]",

        // ── Nav arrows ────────────────────────────────────
        nav: "flex items-center gap-1",
        button_previous: cn(
          "inline-flex items-center justify-center w-7 h-7 rounded-[7px] border transition-colors",
          "border-[#e2e8f0] bg-[#F0FAF3] text-[#3D6B4F]",
          "hover:bg-white hover:border-[#1A7A42] hover:text-[#1A7A42]",
          "absolute left-0",
        ),
        button_next: cn(
          "inline-flex items-center justify-center w-7 h-7 rounded-[7px] border transition-colors",
          "border-[#e2e8f0] bg-[#F0FAF3] text-[#3D6B4F]",
          "hover:bg-white hover:border-[#1A7A42] hover:text-[#1A7A42]",
          "absolute right-0",
        ),

        // ── Grid ──────────────────────────────────────────
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-[#94a3b8] rounded-md w-9 font-semibold text-[10px] uppercase tracking-wide",
        week: "flex w-full mt-1",
        day: cn(
          "relative p-0 text-center text-[13px] focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-[#F0FAF3]",
          "[&:has([aria-selected].day-outside)]:bg-[#F0FAF3]/50",
          "[&:has([aria-selected].day-range-end)]:rounded-r-[8px]",
          "[&:has([aria-selected].day-range-start)]:rounded-l-[8px]",
        ),

        // ── Day button ────────────────────────────────────
        day_button: cn(
          "inline-flex items-center justify-center w-9 h-9 rounded-[8px]",
          "text-[13px] font-medium transition-all",
          "text-[#374151]",
          "hover:bg-[#F0FAF3] hover:text-[#1A7A42]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A7A42]",
        ),

        // ── States ────────────────────────────────────────
        range_start:
          "day-range-start rounded-l-[8px] bg-[#1A7A42] text-white font-bold hover:bg-[#239452] hover:text-white",
        range_end:
          "day-range-end rounded-r-[8px] bg-[#1A7A42] text-white font-bold hover:bg-[#239452] hover:text-white",
        selected:
          "bg-[#1A7A42] text-white font-bold hover:bg-[#239452] hover:text-white focus:bg-[#1A7A42] focus:text-white",
        today: "bg-[rgba(26,122,66,0.08)] text-[#1A7A42] font-bold",
        outside:
          "day-outside text-[#cbd5e1] aria-selected:bg-[#F0FAF3]/50 aria-selected:text-[#94a3b8]",
        disabled: "text-[#e2e8f0] cursor-not-allowed opacity-50",
        range_middle:
          "aria-selected:bg-[#F0FAF3] aria-selected:text-[#1A7A42]",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon =
            orientation === "left"
              ? ChevronLeft
              : orientation === "right"
                ? ChevronRight
                : orientation === "up"
                  ? ChevronUp
                  : ChevronDown;
          return <Icon className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";
