export default function Checkbox({
  label,
  name,
  defaultChecked,
  disabled,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-neutral-200/80 bg-white/60 px-4 py-3 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 dark:border-neutral-700/50 dark:bg-neutral-800/40 dark:text-neutral-300 dark:hover:bg-neutral-800/60">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800"
      />
      {label}
    </label>
  );
}
