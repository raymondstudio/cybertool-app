"use client";

import { useParams } from "next/navigation";

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-slate-900">Incident {id}</h1>
          <p className="text-slate-600 mt-1">Detail view and analysis</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Incident Details
          </h2>

          {/* Placeholder */}
          <div className="bg-slate-50 border border-slate-200 rounded p-8 text-center">
            <p className="text-slate-600 text-lg mb-2">
              📄 Placeholder — Phase 6 (Detail Page) Implementation
            </p>
            <p className="text-slate-500 text-sm">
              When Phase 6 is complete, this page will display:
            </p>
            <ul className="text-sm text-slate-600 mt-4 space-y-1 max-w-md mx-auto">
              <li>✓ Classification (type, confidence)</li>
              <li>✓ Severity (level, score, reasons)</li>
              <li>✓ Summary</li>
              <li>✓ Technical indicators (IOCs)</li>
              <li>✓ PII detected and redacted</li>
              <li>✓ Original vs. sanitized reports</li>
              <li>✓ Related incidents and clusters</li>
              <li>✓ Routing recommendation</li>
              <li>✓ Recommended action</li>
              <li>✓ Status timeline</li>
            </ul>
          </div>

          {/* Status */}
          <div className="mt-8">
            <div className="bg-blue-50 border border-blue-200 rounded p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Status</h3>
              <p className="text-sm text-blue-800">
                Phase 6 will be implemented after Phases 2–5 are complete. This page will
                render read-only analysis data, allow status changes, and provide deep
                incident understanding for security analysts.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
