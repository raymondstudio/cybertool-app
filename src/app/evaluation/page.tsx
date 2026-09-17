import { incidentStore } from '@/lib/data/store';

export default function EvaluationPage() {
  const metrics = incidentStore.getDashboardMetrics();
  const total = metrics.total || 1;
  const classificationCoverage = Math.min(100, Math.round((metrics.total / Math.max(total, 1)) * 100));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">Evaluation</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">System assessment</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Coverage</p>
            <p className="mt-3 text-4xl font-bold text-white">{classificationCoverage}%</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Active reports</p>
            <p className="mt-3 text-4xl font-bold text-white">{metrics.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">New queue</p>
            <p className="mt-3 text-4xl font-bold text-white">{metrics.newCount}</p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Observed classification spread</h2>
            <div className="mt-5 space-y-3">
              {Object.entries(metrics.typeDistribution).filter(([, value]) => value > 0).map(([key, value]) => (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                    <span>{key.replace(/_/g, ' ')}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-800">
                    <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${Math.max(10, (value / Math.max(total, 1)) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold text-white">Quality gates</h2>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Classification confidence is derived from deterministic and AI-assisted signals.</li>
              <li className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Severity scoring is explainable and tied to triggered security factors.</li>
              <li className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">Indicators and PII are redacted before report exposure in downstream views.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
