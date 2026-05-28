export default function SelectField({
  label,
  name,
  options,
  defaultValue = "",
  required = false,
  className = "",
  disabled,
  error,
  onBlur,
  onChange,
}: {
  label: string;
  name: string;
  options: Array<{ value: string | number; label: string }>;
  defaultValue?: string | number;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  error?: string;
  onBlur?: React.FocusEventHandler<HTMLSelectElement>;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}) {
  return (
    <div className={`grid gap-1 ${className}`}>
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label} {required ? "*" : ""}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={String(defaultValue)}
        disabled={disabled}
        onBlur={onBlur}
        onChange={onChange}
        className={`rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 outline-none transition-colors duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-neutral-100 disabled:text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:focus:border-indigo-500 dark:disabled:bg-neutral-800 ${error ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-500" : ""}`}
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={`${name}-${opt.value}`} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs font-medium text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
