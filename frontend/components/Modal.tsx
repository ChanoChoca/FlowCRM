export default function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex items-start sm:items-center justify-center bg-black/50 p-2 sm:p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-4xl max-h-full sm:max-h-[calc(100vh-5rem)] overflow-y-auto rounded-xl sm:rounded-2xl border border-neutral-200/80 bg-white/95 p-4 sm:p-6 shadow-2xl backdrop-blur-xl animate-fade-in-up dark:border-neutral-700/50 dark:bg-neutral-900/95">
        <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-600 transition-all duration-200 hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
