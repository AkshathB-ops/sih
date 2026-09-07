import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const BASE_FIELD =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-600 focus:outline-none disabled:bg-gray-100";

export interface FieldWrapperProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}

export function FieldWrapper({ label, hint, error, htmlFor, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1">
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      ) : null}
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : hint ? <p className="text-sm text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${BASE_FIELD} ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${BASE_FIELD} ${className}`} {...props}>
      {children}
    </select>
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${BASE_FIELD} min-h-[96px] ${className}`} {...props} />;
}