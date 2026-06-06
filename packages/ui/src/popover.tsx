"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { X } from "lucide-react";
import { cn } from "./utils";


const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;


const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 6, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        // Base
        "z-50 w-72 rounded-[12px] border p-4 outline-none",
        // Colors
        "bg-white border-[#e2e8f0]",
        // Shadow
        "shadow-[0_8px_32px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)]",
        // Animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        "data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2",
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;


const PopoverClose = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Close>
>(({ className, ...props }, ref) => (
  <PopoverPrimitive.Close
    ref={ref}
    className={cn(
      "absolute top-3 right-3 inline-flex items-center justify-center",
      "w-6 h-6 rounded-[6px] transition-colors",
      "text-[#94a3b8] hover:bg-[#F0FAF3] hover:text-[#1A7A42]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A7A42]",
      className,
    )}
    {...props}
  >
    <X className="w-3.5 h-3.5" />
    <span className="sr-only">Close</span>
  </PopoverPrimitive.Close>
));
PopoverClose.displayName = PopoverPrimitive.Close.displayName;


import { Calendar } from "./calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DatePickerPopoverProps {
  selected?: Date;
  onSelect?: (date?: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePickerPopover({
  selected,
  onSelect,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-[42px] w-full items-center gap-2.5 rounded-[10px] border px-3.5 text-[13px] font-medium",
            "transition-all outline-none text-left",
            "bg-[#F0FAF3] border-[#e2e8f0]",
            "hover:bg-white hover:border-[#1A7A42]",
            "focus:bg-white focus:border-[#1A7A42]",
            "focus:[outline:2px_solid_#1A7A42] focus:[outline-offset:-2px]",
            "data-[state=open]:bg-white data-[state=open]:border-[#1A7A42]",
            "data-[state=open]:[outline:2px_solid_#1A7A42] data-[state=open]:[outline-offset:-2px]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <CalendarIcon
            className="w-4 h-4 shrink-0"
            style={{ color: "#1A7A42" }}
          />
          <span style={{ color: selected ? "#1C1C1C" : "#3D6B4F" }}>
            {selected ? format(selected, "PPP") : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0 overflow-hidden">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}


export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverClose };
