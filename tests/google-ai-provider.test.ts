import test from 'node:test';
import assert from 'node:assert/strict';

import {
  extractTextFromResponse,
  getGoogleGenAiConfig,
} from '../src/lib/ai/google-genai';

test('getGoogleGenAiConfig prefers GEMINI_API_KEY and defaults the supported model', () => {
  const previousApiKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.GEMINI_MODEL;

  delete process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_MODEL;

  assert.throws(() => getGoogleGenAiConfig(), /GEMINI_API_KEY/i);

  process.env.GEMINI_API_KEY = 'demo-key';
  process.env.GEMINI_MODEL = 'gemini-2.5-flash';

  const config = getGoogleGenAiConfig();
  assert.equal(config.apiKey, 'demo-key');
  assert.equal(config.model, 'gemini-2.5-flash');

  if (previousApiKey === undefined) {
    delete process.env.GEMINI_API_KEY;
  } else {
    process.env.GEMINI_API_KEY = previousApiKey;
  }

  if (previousModel === undefined) {
    delete process.env.GEMINI_MODEL;
  } else {
    process.env.GEMINI_MODEL = previousModel;
  }
});

test('extractTextFromResponse reads the text payload from GenAI responses', () => {
  const payload = {
    text: 'This is a summary from the GenAI SDK.',
  };

  assert.equal(extractTextFromResponse(payload), 'This is a summary from the GenAI SDK.');

  const nestedPayload = {
    candidates: [
      {
        content: {
          parts: [
            {
              text: 'Nested summary text',
            },
          ],
        },
      },
    ],
  };

  assert.equal(extractTextFromResponse(nestedPayload), 'Nested summary text');
});
