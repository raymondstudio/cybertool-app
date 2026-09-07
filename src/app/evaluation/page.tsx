"use client";

export default function EvaluationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Evaluation</h1>
          <p className="text-slate-600 mt-1">System performance metrics</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Performance Metrics
          </h2>

          {/* Placeholder */}
          <div className="bg-slate-50 border border-slate-200 rounded p-8 text-center">
            <p className="text-slate-600 text-lg mb-2">
              📊 Placeholder — Phase 8 (Evaluation) Implementation
            </p>
            <p className="text-slate-500 text-sm">
              When Phase 8 is complete, this page will display classification accuracy,
              severity F1 score, IOC extraction precision/recall, PII detection metrics,
              clustering F1, and overall system performance.
            </p>
          </div>

          {/* Metrics Description */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded p-6">
              <h3 className="font-semibold text-green-900 mb-2">Metrics to Track</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>📈 Classification Accuracy</li>
                <li>📈 Severity F1 Score</li>
                <li>📈 IOC Extraction (P/R/F1)</li>
                <li>📈 PII Detection (P/R/F1)</li>
                <li>📈 Clustering F1 Score</li>
                <li>📈 Average Latency (ms)</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded p-6">
              <h3 className="font-semibold text-purple-900 mb-2">Status</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>✅ Evaluation methodology defined (PRD)</li>
                <li>⏳ Phase 2–7: Core implementation</li>
                <li>⏳ Phase 8: Dataset generation (500+ reports)</li>
                <li>⏳ Phase 8: Ground truth labeling</li>
                <li>⏳ Phase 8: Metric computation</li>
              </ul>
            </div>
          </div>

          {/* Commitment to Honesty */}
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded p-6">
            <h3 className="font-semibold text-amber-900 mb-2">🤝 Commitment</h3>
            <p className="text-sm text-amber-800">
              All metrics will be computed honestly from actual system performance against
              a diverse, labeled test dataset. No fabricated, estimated, or wishful thinking
              metrics. Every number will be defensible and reproducible.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
