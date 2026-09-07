import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-4xl font-bold text-slate-900">
            CAMPUS SECURED
          </h1>
          <p className="text-slate-600 mt-1">
            Incident Triage Platform — Transform chaos into clarity
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-md p-12 mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Dashboard
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Phase 1: Scaffolding in progress. Placeholders ready for Phase 2 implementation.
          </p>
          <div className="inline-block bg-blue-50 border-l-4 border-blue-500 px-6 py-4 rounded">
            <p className="text-blue-900 font-semibold">
              ✅ Foundation Complete
            </p>
            <p className="text-blue-800 text-sm mt-1">
              Types, schemas, and API routes ready. Phase 2 begins with analysis engine.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Link
            href="/incidents"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-slate-50 transition"
          >
            <div className="text-red-600 text-3xl mb-3">📋</div>
            <h3 className="text-lg font-semibold text-slate-900">Incidents</h3>
            <p className="text-sm text-slate-600 mt-2">
              View incident queue and details
            </p>
          </Link>

          <Link
            href="/clusters"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-slate-50 transition"
          >
            <div className="text-orange-600 text-3xl mb-3">🔗</div>
            <h3 className="text-lg font-semibold text-slate-900">Clusters</h3>
            <p className="text-sm text-slate-600 mt-2">
              View correlated incident groups
            </p>
          </Link>

          <Link
            href="/evaluation"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-slate-50 transition"
          >
            <div className="text-green-600 text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-slate-900">Evaluation</h3>
            <p className="text-sm text-slate-600 mt-2">
              View system performance metrics
            </p>
          </Link>

          <Link
            href="#"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-slate-50 transition opacity-50 cursor-not-allowed"
          >
            <div className="text-blue-600 text-3xl mb-3">⚙️</div>
            <h3 className="text-lg font-semibold text-slate-900">Settings</h3>
            <p className="text-sm text-slate-600 mt-2">
              (Coming soon)
            </p>
          </Link>

          <Link
            href="#"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:bg-slate-50 transition opacity-50 cursor-not-allowed"
          >
            <div className="text-purple-600 text-3xl mb-3">👤</div>
            <h3 className="text-lg font-semibold text-slate-900">Profile</h3>
            <p className="text-sm text-slate-600 mt-2">
              (Coming soon)
            </p>
          </Link>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-slate-600 text-sm font-semibold">Total Reports</p>
            <p className="text-4xl font-bold text-slate-900 mt-2">0</p>
            <p className="text-slate-500 text-xs mt-1">Awaiting Phase 2</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-red-600 text-sm font-semibold">🔴 Critical</p>
            <p className="text-4xl font-bold text-red-600 mt-2">0</p>
            <p className="text-slate-500 text-xs mt-1">Requires immediate action</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-orange-600 text-sm font-semibold">🟠 High</p>
            <p className="text-4xl font-bold text-orange-600 mt-2">0</p>
            <p className="text-slate-500 text-xs mt-1">Awaiting investigation</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-blue-600 text-sm font-semibold">Clusters</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">0</p>
            <p className="text-slate-500 text-xs mt-1">Active correlation groups</p>
          </div>
        </div>

        {/* Development Timeline */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">
            Development Roadmap
          </h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-2xl mr-4">✅</span>
              <div>
                <p className="font-semibold text-slate-900">Phase 0–1: Foundation</p>
                <p className="text-slate-600 text-sm">
                  PRD complete. Types, errors, API route structure ready. Next.js scaffolded.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-4">⏳</span>
              <div>
                <p className="font-semibold text-slate-900">Phase 2: Analysis Engine</p>
                <p className="text-slate-600 text-sm">
                  Gemini classification, severity scoring, IOC extraction, PII detection, summarization,
                  routing, recommendations.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-4">⏳</span>
              <div>
                <p className="font-semibold text-slate-900">Phase 3: Persistence</p>
                <p className="text-slate-600 text-sm">
                  Supabase integration. Store and retrieve incidents, analyses, indicators.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-4">⏳</span>
              <div>
                <p className="font-semibold text-slate-900">Phase 4–6: UI Pages</p>
                <p className="text-slate-600 text-sm">
                  Incident queue, detail page, clustering, dashboard metrics.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <span className="text-2xl mr-4">⏳</span>
              <div>
                <p className="font-semibold text-slate-900">Phase 7–8: Evaluation</p>
                <p className="text-slate-600 text-sm">
                  Dataset generation, metric computation, honest evaluation reporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-600 text-sm">
          <p>CAMPUS SECURED Hackathon Challenge — Incident Triage Platform</p>
          <p>Deadline: September 18, 2026</p>
        </div>
      </footer>
    </div>
  );
}
