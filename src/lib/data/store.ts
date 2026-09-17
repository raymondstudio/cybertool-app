/**
 * In-memory incident store (development/demo persistence)
 *
 * This provides a working persistence layer using an in-memory store
 * that is suitable for the hackathon demo.
 *
 * Production path: Replace with Supabase client when credentials are configured.
 * The interface is already defined to make that swap easy.
 */

import type { IncidentAnalysis } from '@/types/incident';
import { IncidentStatus } from '@/types/incident';
import type { StoredIncidentSummary } from '../analysis/similarity';
import type { ExtractedIndicator } from '../analysis/types';
import { IncidentType } from '@/types/incident';

// ─── In-memory store ──────────────────────────────────────────────────────────

interface StoredIncident {
  analysis: IncidentAnalysis;
  priorityScore: number;
}

class IncidentStore {
  private incidents: Map<string, StoredIncident> = new Map();
  private counter = 0;

  generateId(): string {
    this.counter++;
    const seq = String(this.counter).padStart(4, '0');
    return `INC-${seq}`;
  }

  save(analysis: IncidentAnalysis, priorityScore: number): void {
    this.incidents.set(analysis.incidentId, { analysis, priorityScore });
  }

  getById(id: string): IncidentAnalysis | null {
    return this.incidents.get(id)?.analysis ?? null;
  }

  /**
   * Return incidents as a flat list, sorted by priority (highest first).
   */
  list(filters?: {
    severity?: string;
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): {
    incidents: IncidentAnalysis[];
    total: number;
    pages: number;
  } {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;

    let results = Array.from(this.incidents.values());

    // Apply filters
    if (filters?.severity) {
      results = results.filter(
        (r) => r.analysis.severity === filters.severity
      );
    }
    if (filters?.type) {
      results = results.filter(
        (r) => r.analysis.incidentType === filters.type
      );
    }
    if (filters?.status) {
      results = results.filter(
        (r) => r.analysis.status === filters.status
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.analysis.incidentId.toLowerCase().includes(q) ||
          r.analysis.summary.toLowerCase().includes(q) ||
          r.analysis.technicalIndicators.some((i) =>
            i.value.toLowerCase().includes(q)
          )
      );
    }

    // Sort by priority score descending, then by creation time descending
    results.sort(
      (a, b) =>
        b.priorityScore - a.priorityScore ||
        b.analysis.createdAt.getTime() - a.analysis.createdAt.getTime()
    );

    const total = results.length;
    const pages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paged = results.slice(start, start + limit).map((r) => r.analysis);

    return { incidents: paged, total, pages };
  }

  update(
    id: string,
    updates: { status?: IncidentStatus; notes?: string }
  ): IncidentAnalysis | null {
    const stored = this.incidents.get(id);
    if (!stored) return null;

    const analysis = { ...stored.analysis };

    if (updates.status && updates.status !== analysis.status) {
      analysis.status = updates.status;
      analysis.statusHistory = [
        ...analysis.statusHistory,
        { status: updates.status, timestamp: new Date() },
      ];
    }

    if (updates.notes !== undefined) {
      analysis.notes = updates.notes;
    }

    analysis.updatedAt = new Date();

    this.incidents.set(id, { ...stored, analysis });
    return analysis;
  }

  /**
   * Return summaries for similarity comparison.
   * Does not return the current incident (filtered by ID).
   */
  getSummariesExcluding(excludeId: string): StoredIncidentSummary[] {
    return Array.from(this.incidents.values())
      .filter((s) => s.analysis.incidentId !== excludeId)
      .map((s) => ({
        incidentId: s.analysis.incidentId,
        normalizedText: s.analysis.originalReport,
        indicators: s.analysis.technicalIndicators as ExtractedIndicator[],
        incidentType: s.analysis.incidentType,
        createdAt: s.analysis.createdAt,
      }));
  }

  /**
   * Compute dashboard metrics from current store.
   */
  getDashboardMetrics(): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    newCount: number;
    activeClusters: number;
    typeDistribution: Record<string, number>;
    recentIncidents: IncidentAnalysis[];
  } {
    const all = Array.from(this.incidents.values());
    const analyses = all.map((a) => a.analysis);

    const typeDistribution: Record<string, number> = {};
    for (const t of Object.values(IncidentType)) {
      typeDistribution[t] = analyses.filter((a) => a.incidentType === t).length;
    }

    const clusterIds = new Set(
      analyses.filter((a) => a.clusterId).map((a) => a.clusterId!)
    );

    const topByPriority = all
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 10)
      .map((a) => a.analysis);

    return {
      total: analyses.length,
      critical: analyses.filter((a) => a.severity === 'CRITICAL').length,
      high: analyses.filter((a) => a.severity === 'HIGH').length,
      medium: analyses.filter((a) => a.severity === 'MEDIUM').length,
      low: analyses.filter((a) => a.severity === 'LOW').length,
      newCount: analyses.filter((a) => a.status === IncidentStatus.NEW).length,
      activeClusters: clusterIds.size,
      typeDistribution,
      recentIncidents: topByPriority,
    };
  }

  count(): number {
    return this.incidents.size;
  }
}

// Singleton — one store per server process
export const incidentStore = new IncidentStore();
