import Link from "next/link";

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1 w-screen">
      <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
        <img alt="grid" src="/images/shape/grid-01.svg" loading="lazy" />
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]">
        <img alt="grid" src="/images/shape/grid-01.svg" loading="lazy" />
      </div>
      <div className="mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]">
        <h1 className="mb-8 font-bold text-gray-800 sm:text-4xl sm:leading-11 dark:text-white/90 xl:text-7xl xl:leading-22.5">
          ERROR
        </h1>
        <picture>
          <source
            srcSet="/images/error/404-dark.svg"
            media="(prefers-color-scheme: dark)"
          />
          <img src="/images/error/404.svg" alt="404" />
        </picture>
        <p className="mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
          ¡Parece que no podemos encontrar la página que estás buscando!
        </p>
        <Link
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          href="/"
          data-discover="true"
        >
          Volver a la Página de Inicio
        </Link>
      </div>
      <p className="absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400">
        © 2026 - FlowCRM
      </p>
    </div>
  );
}
