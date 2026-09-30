import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rewriteLink, sync } from './sync.mjs';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { pages } from './catalog.mjs';
test('snapshot links stay in their version and source links stay pinned', () => {
  assert.equal(rewriteLink('CLARION.md#models', 'docs/README.md', '26.1.0', 'abc'), '/v/26.1.0/clarion#models');
  assert.equal(rewriteLink('../README.md#quick-start', 'docs/GETTING-STARTED.md', 'dev', 'abc'), '/v/dev/overview#quick-start');
  assert.equal(rewriteLink('../samples/Caravel.App/Program.cs', 'docs/GETTING-STARTED.md', 'dev', 'abc'), 'https://github.com/Clinimatix/Caravel/blob/abc/samples/Caravel.App/Program.cs');
  assert.equal(rewriteLink('https://github.com/Clinimatix/Caravel/blob/main/docs/QUEUES.md', 'README.md', 'dev', 'abc'), '/v/dev/queues');
  assert.equal(rewriteLink('#models', 'docs/CLARION.md', 'dev', 'abc'), '#models');
  assert.throws(() => sync('.', 'HEAD', '../escape'), /exact Caravel version/);
});
test('release snapshots require matching tags and cannot be overwritten', t => {
  const folder = mkdtempSync(join(tmpdir(), 'caravel-docs-'));
  t.after(() => { if (dirname(folder) === tmpdir() && folder.startsWith(join(tmpdir(), 'caravel-docs-'))) rmSync(folder, { recursive: true, force: true }); });
  const repo = join(folder, 'framework');
  const output = join(folder, 'output');
  mkdirSync(repo);
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
  git('init', '-q');
  git('config', 'core.autocrlf', 'false');
  for (const page of pages) {
    const path = join(repo, page.source);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, '# Synthetic guide\n');
  }
  writeFileSync(join(repo, 'Directory.Build.props'), '<Project><Version>26.1.0</Version></Project>');
  git('add', '.');
  git('-c', 'user.name=Documentation Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'Synthetic documentation');
  git('tag', 'v26.1.0');
  sync(repo, 'HEAD', '26.1.0', output);
  const snapshot = readFileSync(join(output, 'site/v/26.1.0/overview.md'), 'utf8');
  writeFileSync(join(repo, 'README.md'), '# Updated synthetic guide\n');
  git('add', 'README.md');
  git('-c', 'user.name=Documentation Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'Change guide');
  sync(repo, 'HEAD', 'dev', output);
  assert.equal(readFileSync(join(output, 'site/v/26.1.0/overview.md'), 'utf8'), snapshot);
  assert.match(readFileSync(join(output, 'site/v/dev/overview.md'), 'utf8'), /Updated synthetic/);
  assert.throws(() => sync(repo, 'HEAD', '26.1.0', output), /match its version tag/);
  assert.throws(() => sync(repo, 'v26.1.0', '26.1.0', output), /already exists/);
  git('tag', 'v26.2.0');
  assert.throws(() => sync(repo, 'HEAD', '26.2.0', output), /must agree/);
  assert.equal(existsSync(join(output, 'site/v/26.2.0')), false);
});
