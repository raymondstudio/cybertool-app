import Link from 'next/link';
import { incidentStore } from '@/lib/data/store';

export default function IncidentsPage() {
  const result = incidentStore.list({ page: 1, limit: 10 });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Operations</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Incident queue</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <h2 className="text-xl font-semibold text-white">Priority queue</h2>
            <span className="text-sm text-slate-400">{result.total} total</span>
          </div>

          {result.incidents.length === 0 ? (
            <div className="p-10 text-center"><p className="text-slate-200">No incidents in the queue</p><p className="mt-2 text-sm text-slate-400">Analyze a report or upload a screenshot to create the first incident record.</p><Link href="/incidents/new" className="mt-5 inline-flex bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300">Analyze new incident</Link></div>
          ) : (
            <div className="divide-y divide-slate-800">
              {result.incidents.map((incident) => (
                <Link key={incident.incidentId} href={`/incidents/${incident.incidentId}`} className="block p-5 transition hover:bg-slate-950/40">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{incident.incidentId}</span>
                        <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] font-medium uppercase text-slate-200">
                          {incident.status}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-white">{incident.incidentType.replace(/_/g, ' ')}</h3>
                      <p className="mt-1 text-sm text-slate-300">{incident.summary}</p>
                    </div>
                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-200">
                        {incident.severity}
                      </span>
                      <span className="text-xs text-slate-400">{incident.technicalIndicators.length} indicators</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
