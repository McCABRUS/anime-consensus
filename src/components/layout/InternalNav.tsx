import Link from "next/link";

type InternalNavProps = {
  locale: string;
};

export default function InternalNav({ locale }: InternalNavProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Link href={`/${locale}`} className="group flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/80 text-[9px] font-semibold tracking-[0.15em] text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
            C
          </span>

          <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-400 transition-colors duration-300 group-hover:text-white sm:block">
            Anime Consensus
          </span>
        </Link>

        <Link
          href={`/${locale}`}
          className="group flex items-center gap-3 rounded-full border border-zinc-800 bg-zinc-950/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 backdrop-blur-md transition-all duration-300 hover:border-zinc-600 hover:bg-zinc-900 hover:text-white"
        >
          <span className="text-sm transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>

          <span className="hidden sm:inline">Home</span>
        </Link>
      </div>
    </header>
  );
}
