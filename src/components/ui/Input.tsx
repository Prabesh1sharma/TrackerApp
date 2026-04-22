"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", id, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={`w-full bg-bg-primary border rounded-xl py-3 text-text-primary placeholder:text-text-muted transition-colors ${
              icon ? "pl-11" : "pl-4"
            } pr-4 ${
              error
                ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                : "border-border-default focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
            } ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-accent-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
