import test from 'node:test';
import assert from 'node:assert/strict';

import { validateIncidentReport } from '../src/lib/validation/report';
import { classifyIncident } from '../src/lib/analysis/classify';
import { IncidentType } from '../src/types/incident';

test('validateIncidentReport accepts a useful report', () => {
  const result = validateIncidentReport({
    report: 'User clicked a fake login link and entered their password on a suspicious portal.',
    source: 'email',
    affectedSystem: 'Student Portal',
  });

  assert.equal(result.report.trim().length > 10, true);
  assert.equal(result.source, 'email');
  assert.equal(result.affectedSystem, 'Student Portal');
});

test('validateIncidentReport rejects empty or whitespace-only input', () => {
  assert.throws(() => {
    validateIncidentReport({ report: '   ' });
  }, /report/i);
});

test('classifyIncident labels phishing reports as phishing', () => {
  const result = classifyIncident(
    'A user received a fake login email asking them to enter their password on a lookalike portal.'
  );

  assert.equal(result.type, IncidentType.PHISHING);
  assert.ok(result.confidence >= 0.5);
});
