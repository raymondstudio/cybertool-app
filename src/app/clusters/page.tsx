import { incidentStore } from '@/lib/data/store';

export default function ClustersPage() {
  const metrics = incidentStore.getDashboardMetrics();
  const clusterCount = metrics.activeClusters;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-xs uppercase tracking-[0.24em] text-amber-300">Correlation</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Cluster view</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Clusters</p>
            <p className="mt-3 text-4xl font-bold text-white">{clusterCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Reports in scope</p>
            <p className="mt-3 text-4xl font-bold text-white">{metrics.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">High risk</p>
            <p className="mt-3 text-4xl font-bold text-white">{metrics.high + metrics.critical}</p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Linked findings</h2>
          <div className="mt-5 space-y-3">
            {metrics.recentIncidents.length === 0 ? (
              <p className="text-slate-400">No clusterable incidents are present in the current dataset.</p>
            ) : (
              metrics.recentIncidents.slice(0, 5).map((incident) => (
                <div key={incident.incidentId} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{incident.incidentId}</p>
                      <h3 className="mt-2 text-lg font-medium text-white">{incident.incidentType.replace(/_/g, ' ')}</h3>
                    </div>
                    <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs uppercase tracking-wide text-slate-200">
                      {incident.severity}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{incident.summary}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
