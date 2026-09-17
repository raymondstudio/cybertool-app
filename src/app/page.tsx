import Link from 'next/link';
import { incidentStore } from '@/lib/data/store';

export default function DashboardPage() {
  const metrics = incidentStore.getDashboardMetrics();
  const recentIncidents = metrics.recentIncidents.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Campus Secured</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Threat Operations Dashboard</h1>
          </div>
          <Link href="/incidents" className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 hover:bg-cyan-500/20">
            View incident queue
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total reports</p>
            <p className="mt-3 text-4xl font-bold text-white">{metrics.total}</p>
            <p className="mt-2 text-xs text-slate-400">Currently in the live incident store</p>
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <p className="text-sm text-red-200">Critical</p>
            <p className="mt-3 text-4xl font-bold text-red-200">{metrics.critical}</p>
            <p className="mt-2 text-xs text-red-300">Immediate action required</p>
          </div>

          <div className="rounded-2xl border border-orange-500/30 bg-orange-500/10 p-5">
            <p className="text-sm text-orange-200">High</p>
            <p className="mt-3 text-4xl font-bold text-orange-200">{metrics.high}</p>
            <p className="mt-2 text-xs text-orange-300">Active investigations</p>
          </div>

          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-5">
            <p className="text-sm text-cyan-200">Clusters</p>
            <p className="mt-3 text-4xl font-bold text-cyan-200">{metrics.activeClusters}</p>
            <p className="mt-2 text-xs text-cyan-300">Correlated groups</p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent incidents</h2>
              <Link href="/incidents" className="text-sm text-cyan-300 hover:text-cyan-200">Open queue</Link>
            </div>

            {recentIncidents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center text-slate-400">
                No incidents yet. Submit a report through the analysis API to populate the queue.
              </div>
            ) : (
              <div className="space-y-3">
                {recentIncidents.map((incident) => (
                  <Link key={incident.incidentId} href={`/incidents/${incident.incidentId}`} className="block rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-cyan-500/40 hover:bg-slate-950">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{incident.incidentId}</p>
                        <h3 className="mt-2 text-lg font-medium text-white">{incident.incidentType.replace(/_/g, ' ')}</h3>
                      </div>
                      <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200">
                        {incident.severity}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-slate-300">{incident.summary}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Operational snapshot</h2>
            <ul className="mt-5 space-y-4 text-sm text-slate-300">
              <li className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
                <span>Low severity</span>
                <span className="font-semibold text-slate-100">{metrics.low}</span>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
                <span>Medium severity</span>
                <span className="font-semibold text-slate-100">{metrics.medium}</span>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
                <span>High severity</span>
                <span className="font-semibold text-slate-100">{metrics.high}</span>
              </li>
              <li className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
                <span>New reports</span>
                <span className="font-semibold text-slate-100">{metrics.newCount}</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
