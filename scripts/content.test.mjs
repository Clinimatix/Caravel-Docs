import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contentIssues } from './check-content.mjs';

test('published status rejects stale roadmap, feed and install-version claims', () => {
  const state = { released: true, nugetPublished: true, candidate: '26.1.0-rc1' };
  assert.equal(contentIssues("The first release candidate will come once APIs settle. Packages aren't on nuget.org yet.\ndotnet tool install --global Clinimatix.Caravel.Bosun --version 26.1.0-m1", state).length, 3);
  assert.deepEqual(contentIssues('Public Preview 1 is published.\ndotnet tool install --global Clinimatix.Caravel.Bosun --version 26.1.0-rc1', state), []);
  assert.deepEqual(contentIssues('Before a release candidate; not on nuget.org yet.', { released: false, nugetPublished: false }), []);
});
