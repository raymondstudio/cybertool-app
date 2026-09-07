"use client";

export default function ClustersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Clusters</h1>
          <p className="text-slate-600 mt-1">Correlated incident groups</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Incident Clusters
          </h2>

          {/* Placeholder */}
          <div className="bg-slate-50 border border-slate-200 rounded p-8 text-center">
            <p className="text-slate-600 text-lg mb-2">
              🔗 Placeholder — Phase 5 (Correlation) Implementation
            </p>
            <p className="text-slate-500 text-sm">
              When Phase 5 is complete, this page will display groups of related/duplicate
              incidents with similarity scores, common IOCs, and timeline views.
            </p>
          </div>

          {/* Features Description */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-orange-50 border border-orange-200 rounded p-6">
              <h3 className="font-semibold text-orange-900 mb-2">Features (Coming)</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>✓ Cluster detection (exact + fuzzy)</li>
                <li>✓ Similarity scoring</li>
                <li>✓ Common IOCs across cluster</li>
                <li>✓ Timeline of reports</li>
                <li>✓ Click to see all members</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Status</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Types & schemas defined</li>
                <li>⏳ Phase 2: Analysis engine</li>
                <li>⏳ Phase 3: Database storage</li>
                <li>⏳ Phase 5: Clustering algorithm</li>
                <li>⏳ Phase 5: UI implementation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
