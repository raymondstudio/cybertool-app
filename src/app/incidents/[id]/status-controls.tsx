'use client';

import { useState } from 'react';
import { IncidentStatus } from '@/types/incident';

export default function StatusControls({ incidentId, initialStatus, initialNotes }: { incidentId: string; initialStatus: IncidentStatus; initialNotes?: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true); setMessage('');
    try {
      const response = await fetch(`/api/incidents/${incidentId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, notes }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'The incident could not be updated.');
      setStatus(payload.incident.status);
      setMessage('Incident updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The incident could not be updated.');
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm text-slate-300">Status<select value={status} onChange={(event) => setStatus(event.target.value as IncidentStatus)} className="mt-2 w-full border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-400">{Object.values(IncidentStatus).map((item) => <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>)}</select></label>
      <label className="block text-sm text-slate-300">Analyst notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} rows={4} className="mt-2 w-full resize-y border border-slate-700 bg-slate-950 p-3 text-sm leading-6 text-white outline-none focus:border-cyan-400" placeholder="Record triage context or follow-up actions." /></label>
      <button type="button" onClick={save} disabled={busy} className="min-h-11 w-full bg-cyan-400 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Updating...' : 'Save status and notes'}</button>
      {message && <p role="status" className="text-sm text-slate-300">{message}</p>}
    </div>
  );
}
