import { TextareaHTMLAttributes } from "react";

export default function TextAreaField({
  label,
  name,
  defaultValue = "",
  className = "",
  ...props
}: {
  label: string;
  name: string;
  defaultValue?: string;
  className?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`grid gap-1 ${className}`}>
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={3}
        {...props}
        className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none transition-colors duration-200 placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-indigo-500"
      />
    </label>
  );
}
