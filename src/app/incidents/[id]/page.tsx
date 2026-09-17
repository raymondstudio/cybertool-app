import { notFound } from 'next/navigation';
import { incidentStore } from '@/lib/data/store';

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const incident = incidentStore.getById(id);

  if (!incident) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Incident detail</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">{incident.incidentId}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Type</p>
            <p className="mt-3 text-2xl font-semibold text-white">{incident.incidentType.replace(/_/g, ' ')}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Severity</p>
            <p className="mt-3 text-2xl font-semibold text-white">{incident.severity}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Status</p>
            <p className="mt-3 text-2xl font-semibold text-white">{incident.status}</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Summary</h2>
            <p className="mt-4 text-base leading-7 text-slate-300">{incident.summary}</p>

            <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Routing recommendation</p>
              <p className="mt-2 text-lg font-medium text-cyan-200">{incident.recommendedRoute}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                {incident.routingReasoning.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Analyst notes</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {incident.notes ?? 'No analyst notes recorded yet.'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Recommended action</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">{incident.recommendedAction}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Observed indicators</h2>
            <div className="mt-5 space-y-3">
              {incident.technicalIndicators.length === 0 ? (
                <p className="text-sm text-slate-400">No IOC matches were extracted.</p>
              ) : (
                incident.technicalIndicators.map((indicator) => (
                  <div key={`${indicator.type}-${indicator.value}`} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300">
                    <p className="font-medium text-white">{indicator.type}</p>
                    <p className="mt-1 break-all">{indicator.value}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Sanitized report</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-300">{incident.sanitizedReport}</p>
          </div>
        </section>
      </main>
    </div>
  );
}
