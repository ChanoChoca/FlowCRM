import { InputHTMLAttributes } from "react";

export default function Field({
  label,
  name,
  defaultValue,
  required,
  disabled,
  className,
  type = "text",
  error,
  onBlur,
  onChange,
}: {
  label: string;
  name: string;
  error?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        onBlur={onBlur}
        onChange={onChange}
        className={`w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none transition-colors duration-200 placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-neutral-100 disabled:text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:placeholder:text-neutral-500 dark:focus:border-indigo-500 dark:disabled:bg-neutral-800 ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500" : ""}`}
      />
      {error && (
        <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
