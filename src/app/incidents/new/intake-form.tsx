'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useEffect, useRef, useState } from 'react';
import type { IncidentAnalysis } from '@/types/incident';

const sources = ['EMAIL', 'WHATSAPP', 'PHONE', 'HELPDESK', 'SOC_ALERT', 'USER_REPORT', 'SYSTEM_ALERT', 'SCREENSHOT', 'OTHER'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const acceptedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);

type ImageFinding = { name: string; extractedText: string; evidence: string[] };
type AnalysisResponse = { incident: IncidentAnalysis; priorityScore: number; imageAnalysis: ImageFinding[] };

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-slate-800 bg-slate-900 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ResultView({ result }: { result: AnalysisResponse }) {
  const { incident } = result;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-cyan-500/30 bg-cyan-500/10 p-4"><p className="text-xs uppercase tracking-wider text-cyan-200">Type</p><p className="mt-2 text-lg font-semibold text-white">{incident.incidentType.replace(/_/g, ' ')}</p><p className="mt-1 text-sm text-cyan-100">{Math.round(incident.typeConfidence * 100)}% confidence</p></div>
        <div className="border border-orange-500/30 bg-orange-500/10 p-4"><p className="text-xs uppercase tracking-wider text-orange-200">Severity</p><p className="mt-2 text-lg font-semibold text-white">{incident.severity}</p><p className="mt-1 text-sm text-orange-100">Risk score {incident.severityScore}/100</p></div>
        <div className="border border-slate-700 bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">Queue priority</p><p className="mt-2 text-lg font-semibold text-white">{result.priorityScore}/100</p><p className="mt-1 text-sm text-slate-400">Ready for analyst review</p></div>
      </div>

      <Panel title="Summary"><p className="leading-7 text-slate-200">{incident.summary}</p></Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Severity reasoning"><ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">{incident.severityReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></Panel>
        <Panel title="Recommended route"><p className="font-semibold text-cyan-200">{incident.recommendedRoute.replace(/_/g, ' ')}</p><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-300">{incident.routingReasoning.map((reason) => <li key={reason}>{reason}</li>)}</ul></Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={`Technical indicators (${incident.technicalIndicators.length})`}>
          {incident.technicalIndicators.length ? <div className="space-y-3">{incident.technicalIndicators.map((indicator) => <div key={`${indicator.type}-${indicator.value}`} className="border border-slate-800 bg-slate-950 p-3"><p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">{indicator.type}</p><p className="mt-1 break-all font-mono text-sm text-white">{indicator.value}</p><p className="mt-1 text-xs text-slate-400">{indicator.context ?? 'Extracted from the submitted evidence.'}</p></div>)}</div> : <p className="text-sm text-slate-400">No technical indicators were identified.</p>}
        </Panel>
        <Panel title={`Privacy findings (${incident.piiDetections.length})`}>
          {incident.piiDetections.length ? <ul className="space-y-3 text-sm text-slate-300">{incident.piiDetections.map((item, index) => <li key={`${item.type}-${index}`} className="border border-slate-800 bg-slate-950 p-3"><span className="font-semibold text-white">{item.type.replace(/_/g, ' ')}</span><span className="ml-2 text-slate-400">redacted as {item.redactedAs}</span></li>)}</ul> : <p className="text-sm text-slate-400">No privacy findings were identified.</p>}
        </Panel>
      </div>

      <Panel title="Sanitized report"><p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{incident.sanitizedReport}</p></Panel>
      <Panel title="Recommended actions"><p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{incident.recommendedAction}</p></Panel>

      {result.imageAnalysis.length > 0 && <Panel title="Screenshot evidence"><div className="space-y-4">{result.imageAnalysis.map((image) => <div key={image.name} className="border border-slate-800 bg-slate-950 p-4"><p className="font-medium text-white">{image.name}</p>{image.extractedText && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{image.extractedText}</p>}{image.evidence.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-400">{image.evidence.map((item) => <li key={item}>{item}</li>)}</ul>}</div>)}</div></Panel>}
    </div>
  );
}

export default function IntakeForm() {
  const [report, setReport] = useState('');
  const [source, setSource] = useState('USER_REPORT');
  const [affectedSystem, setAffectedSystem] = useState('');
  const [reporterCategory, setReporterCategory] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [department, setDepartment] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<'analyze' | 'save' | null>(null);
  const [error, setError] = useState('');
  const previewsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function addFiles(selected: FileList | null) {
    if (!selected) return;
    const next = Array.from(selected);
    if (next.length > 3) return setError('Choose no more than three screenshots.');
    const invalid = next.find((file) => !acceptedTypes.has(file.type) || file.size > MAX_FILE_SIZE || !/\.(png|jpe?g|webp)$/i.test(file.name));
    if (invalid) return setError('Screenshots must be PNG, JPG, JPEG, or WEBP files no larger than 5 MB each.');
    setError('');
    previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const urls = next.map((file) => URL.createObjectURL(file));
    previewsRef.current = urls;
    setPreviews(urls);
    setFiles(next);
  }

  async function handleAnalyze(event: FormEvent) {
    event.preventDefault();
    if (report.trim().length < 10 && files.length === 0) return setError('Add at least 10 characters of report text or upload a screenshot.');
    setBusy('analyze'); setError(''); setResult(null); setSavedId(null);
    try {
      const body = new FormData();
      body.append('report', report);
      body.append('source', source);
      body.append('affectedSystem', affectedSystem);
      body.append('reporterCategory', reporterCategory);
      body.append('incidentTime', incidentTime);
      body.append('department', department);
      files.forEach((file) => body.append('evidence', file));
      const response = await fetch('/api/incidents/analyze', { method: 'POST', body });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Analysis could not be completed.');
      setResult(payload as AnalysisResponse);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Analysis could not be completed.');
    } finally { setBusy(null); }
  }

  async function handleSave() {
    if (!result) return;
    setBusy('save'); setError('');
    try {
      const response = await fetch('/api/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ incident: result.incident, priorityScore: result.priorityScore }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'The incident could not be saved.');
      setSavedId(payload.incident.incidentId);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The incident could not be saved.');
    } finally { setBusy(null); }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Incident intake</p><h1 className="mt-2 text-3xl font-semibold text-white">Analyze a new incident</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Submit the original report and any screenshot evidence. Sentria will structure the findings for analyst review before anything enters the queue.</p></div>
          <Link href="/incidents" className="text-sm text-cyan-300 hover:text-cyan-200">Back to queue</Link>
        </div>

        <form onSubmit={handleAnalyze} className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <Panel title="Incident report"><label htmlFor="report" className="text-sm font-medium text-white">Paste the original report</label><p className="mt-1 text-xs leading-5 text-slate-400">Keep the wording as received. Include messages, URLs, IPs, filenames, and other evidence.</p><textarea id="report" value={report} onChange={(event) => setReport(event.target.value)} rows={14} maxLength={10000} className="mt-4 w-full resize-y border border-slate-700 bg-slate-950 p-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400" placeholder="Example: I received an email asking me to verify my portal password..." /><p className="mt-2 text-right text-xs text-slate-500">{report.length}/10,000</p></Panel>
            <Panel title="Screenshot evidence"><label htmlFor="evidence" className="flex min-h-32 cursor-pointer flex-col items-center justify-center border border-dashed border-slate-600 bg-slate-950 p-5 text-center hover:border-cyan-400"><span className="text-sm font-medium text-white">Choose screenshots</span><span className="mt-1 text-xs text-slate-400">PNG, JPG, JPEG, or WEBP · up to 5 MB each</span><input id="evidence" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => addFiles(event.target.files)} className="sr-only" /></label>{files.length > 0 && <div className="mt-4 grid grid-cols-3 gap-3">{files.map((file, index) => <div key={file.name} className="relative border border-slate-800 bg-slate-950 p-2"><Image src={previews[index]} alt={`Selected evidence ${index + 1}`} width={240} height={240} unoptimized className="aspect-square w-full object-cover" /><button type="button" onClick={() => { URL.revokeObjectURL(previews[index]); const nextFiles = files.filter((_, itemIndex) => itemIndex !== index); const nextPreviews = previews.filter((_, itemIndex) => itemIndex !== index); previewsRef.current = nextPreviews; setFiles(nextFiles); setPreviews(nextPreviews); }} className="mt-2 w-full text-xs text-red-300 hover:text-red-200">Remove</button></div>)}</div>}</Panel>
          </div>

          <div className="space-y-5">
            <Panel title="Optional details"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm text-slate-300">Source<select value={source} onChange={(event) => setSource(event.target.value)} className="mt-2 w-full border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-400">{sources.map((item) => <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>)}</select></label><label className="text-sm text-slate-300">Affected system<input value={affectedSystem} onChange={(event) => setAffectedSystem(event.target.value)} className="mt-2 w-full border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-400" placeholder="Student portal" /></label><label className="text-sm text-slate-300">Reporter category<input value={reporterCategory} onChange={(event) => setReporterCategory(event.target.value)} className="mt-2 w-full border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-400" placeholder="Student, staff, helpdesk" /></label><label className="text-sm text-slate-300">Department/team<input value={department} onChange={(event) => setDepartment(event.target.value)} className="mt-2 w-full border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-400" placeholder="ICT services" /></label><label className="text-sm text-slate-300 sm:col-span-2">Approximate incident time<input value={incidentTime} onChange={(event) => setIncidentTime(event.target.value)} className="mt-2 w-full border border-slate-700 bg-slate-950 p-3 text-white outline-none focus:border-cyan-400" placeholder="2026-09-17 14:30" /></label></div></Panel>
            <div className="border border-cyan-500/20 bg-cyan-500/5 p-5"><p className="text-sm font-semibold text-cyan-100">Review before queue submission</p><p className="mt-2 text-sm leading-6 text-slate-400">Analyze first to inspect classification, severity, privacy findings, indicators, and recommended actions. Saving is a separate step.</p><button type="submit" disabled={busy !== null} className="mt-5 inline-flex min-h-11 w-full items-center justify-center bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50">{busy === 'analyze' ? 'Analyzing evidence...' : 'Analyze incident'}</button></div>
            {error && <p role="alert" className="border border-red-500/40 bg-red-500/10 p-4 text-sm leading-6 text-red-100">{error}</p>}
          </div>
        </form>

        {result && <section className="mt-12 border-t border-slate-800 pt-10"><div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[0.22em] text-emerald-300">Analysis ready</p><h2 className="mt-2 text-2xl font-semibold text-white">Review findings before submission</h2></div>{savedId ? <div className="flex flex-wrap gap-3"><span className="inline-flex min-h-11 items-center border border-emerald-500/30 bg-emerald-500/10 px-4 text-sm text-emerald-200">Saved as {savedId}</span><Link href={`/incidents/${savedId}`} className="inline-flex min-h-11 items-center bg-emerald-400 px-4 text-sm font-semibold text-slate-950">Open incident</Link></div> : <button type="button" onClick={handleSave} disabled={busy !== null} className="min-h-11 bg-emerald-400 px-5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">{busy === 'save' ? 'Saving to queue...' : 'Save to queue'}</button>}</div><ResultView result={result} /></section>}
      </div>
    </main>
  );
}
