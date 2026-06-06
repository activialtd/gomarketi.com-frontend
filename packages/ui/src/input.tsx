import * as React from "react";
import { cn } from "./utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, onFocus, onBlur, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    const setRef = (el: HTMLInputElement | null) => {
      inputRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref)
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
    };

    function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
      e.currentTarget.style.background = "#ffffff";
      e.currentTarget.style.borderColor = "#1A7A42";
      e.currentTarget.style.outline = "2px solid #1A7A42";
      e.currentTarget.style.outlineOffset = "-2px";
      onFocus?.(e);
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
      e.currentTarget.style.background = "#F0FAF3";
      e.currentTarget.style.borderColor = "#e2e8f0";
      e.currentTarget.style.outline = "none";
      onBlur?.(e);
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-[42px] w-full rounded-[10px] border px-3.5 py-2 text-[13px] transition-all",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-[#3D6B4F]/60",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        style={{
          background: "#F0FAF3",
          borderColor: "#e2e8f0",
          color: "#1C1C1C",
          outline: "none",
          ...style,
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={setRef}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
