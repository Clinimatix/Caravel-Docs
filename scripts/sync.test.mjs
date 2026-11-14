import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rewriteLink, sync, writeSnapshot } from './sync.mjs';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

test('snapshot links stay in their version and source links stay pinned', () => {
  assert.equal(rewriteLink('CLARION.md#models', 'docs/README.md', '26.1.0', 'abc'), '/v/26.1.0/clarion#models');
  assert.equal(rewriteLink('../README.md#quick-start', 'docs/GETTING-STARTED.md', 'dev', 'abc'), '/v/dev/overview#quick-start');
  assert.equal(rewriteLink('../samples/Caravel.App/Program.cs', 'docs/GETTING-STARTED.md', 'dev', 'abc'), 'https://github.com/Clinimatix/Caravel/blob/abc/samples/Caravel.App/Program.cs');
  assert.equal(rewriteLink('https://github.com/Clinimatix/Caravel/blob/main/docs/QUEUES.md', 'README.md', 'dev', 'abc'), '/v/dev/queues');
  assert.equal(rewriteLink('#models', 'docs/CLARION.md', 'dev', 'abc'), '#models');
  assert.throws(() => sync('.', 'HEAD', '../escape'), /exact Caravel version/);
});

test('release imports preserve source and reject tag mismatch, version mismatch and overwrite', t => {
  const folder = mkdtempSync(join(tmpdir(), 'caravel-docs-'));
  t.after(() => { if (dirname(folder) === tmpdir() && folder.startsWith(join(tmpdir(), 'caravel-docs-'))) rmSync(folder, { recursive: true, force: true }); });
  const source = { commit: 'release', tagCommit: 'release', candidate: '26.1.0', documents: [{ slug: 'overview', title: 'Overview', source: 'README.md', markdown: '# Synthetic guide' }] };
  writeSnapshot(source, '26.1.0', folder);
  const path = join(folder, 'site/v/26.1.0/overview.md');
  const snapshot = readFileSync(path, 'utf8');
  writeSnapshot({ ...source, commit: 'next', documents: [{ ...source.documents[0], markdown: '# Updated guide' }] }, 'dev', folder);
  assert.equal(readFileSync(path, 'utf8'), snapshot);
  assert.match(readFileSync(join(folder, 'site/v/dev/overview.md'), 'utf8'), /Updated guide/);
  assert.throws(() => writeSnapshot({ ...source, commit: 'next' }, '26.1.0', folder), /match its version tag/);
  assert.throws(() => writeSnapshot(source, '26.1.0', folder), /already exists/);
  assert.throws(() => writeSnapshot(source, '26.2.0', folder), /must agree/);
  assert.equal(existsSync(join(folder, 'site/v/26.2.0')), false);
  const versions = JSON.parse(readFileSync(join(folder, 'site/versions.json'), 'utf8'));
  assert.deepEqual(versions.find(v => v.id === '26.1.0').navigation.flatMap(g => g.items.map(p => p.slug)), ['overview']);
});
