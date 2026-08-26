import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { inspectJSON } from '../components/jsonParse.mjs';

const fixtures = [
  ['valid-json-save.es3', 'valid'],
  ['invalid-json-save.es3', 'repairable'],
  ['invalid-unquoted-keys.es3', 'repairable'],
  ['invalid-single-quotes.es3', 'repairable'],
  ['invalid-comments-trailing-commas.es3', 'repairable'],
  ['irreparable-invalid-unicode.es3', 'irreparable']
];

for (const [fileName, expected] of fixtures) {
  test(`${fileName} is classified as ${expected}`, async () => {
    const fixtureUrl = new URL(`../examples/${fileName}`, import.meta.url);
    const source = await readFile(fixtureUrl, 'utf8');
    const inspection = inspectJSON(source);

    if (expected === 'valid') {
      assert.equal(inspection.isValid, true);
      assert.equal(inspection.isRepairable, false);
      assert.equal(inspection.parsed._fixtureNotice.startsWith('Synthetic'), true);
      return;
    }

    assert.equal(inspection.isValid, false);
    assert.ok(inspection.parseError instanceof Error);

    if (expected === 'repairable') {
      assert.equal(inspection.isRepairable, true);
      assert.doesNotThrow(() => JSON.parse(inspection.repaired));
      assert.equal(await readFile(fixtureUrl, 'utf8'), source);
      return;
    }

    assert.equal(inspection.isRepairable, false);
    assert.equal('repaired' in inspection, false);
  });
}
