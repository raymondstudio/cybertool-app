import Link from 'next/link';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/incidents/new', label: 'New incident' },
  { href: '/incidents', label: 'Incident queue' },
  { href: '/clusters', label: 'Clusters' },
  { href: '/evaluation', label: 'Evaluation' },
];

export function AppNav() {
  return (
    <nav aria-label="Primary navigation" className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/" className="mr-auto text-sm font-semibold tracking-[0.18em] text-cyan-300">
          SENTRIA
        </Link>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-2 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
