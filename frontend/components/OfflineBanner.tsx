"use client";

const SyncIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 animate-spin">
    <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
  </svg>
);

const WarnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
  </svg>
);

interface Props {
  isOnline: boolean;
  pendingCount: number;
}

export default function OfflineBanner({ isOnline, pendingCount }: Props) {
  if (!isOnline) {
    return (
      <div className="flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-xs font-semibold text-white">
        <WarnIcon />
        Sin conexión — modo offline activo
        {pendingCount > 0 && (
          <span className="ml-1 rounded-full bg-white/30 px-2 py-0.5">
            {pendingCount} {pendingCount === 1 ? "venta pendiente" : "ventas pendientes"}
          </span>
        )}
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <div className="flex items-center justify-center gap-2 bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">
        <SyncIcon />
        Sincronizando {pendingCount}{" "}
        {pendingCount === 1 ? "venta guardada offline" : "ventas guardadas offline"}…
      </div>
    );
  }

  return null;
}
