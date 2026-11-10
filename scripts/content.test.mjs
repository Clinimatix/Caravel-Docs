import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contentIssues, snapshotState } from './check-content.mjs';

test('published status rejects stale roadmap, feed and install-version claims', () => {
  const state = { released: true, nugetPublished: true, candidate: '26.1.0-rc1' };
  assert.equal(contentIssues("The first release candidate will come once APIs settle. Packages aren't on nuget.org yet.\ndotnet tool install --global Clinimatix.Caravel.Bosun --version 26.1.0-m1", state).length, 3);
  assert.equal(contentIssues("Reference the package (until it's on NuGet).", state).length, 1);
  assert.deepEqual(contentIssues('Public Preview 1 is published.\ndotnet tool install --global Clinimatix.Caravel.Bosun --version 26.1.0-rc1', state), []);
  assert.deepEqual(contentIssues('Before a release candidate; not on nuget.org yet.', { released: false, nugetPublished: false }), []);
});

test('development installation target stays separate from source metadata', () => {
  const release = { id: '26.1.2-rc2', candidate: '26.1.2-rc2', released: true, nugetPublished: true };
  const dev = { id: 'dev', candidate: '26.1.1-rc2', released: false, installationVersion: '26.1.2-rc2' };
  assert.equal(snapshotState(dev, [dev, release]).candidate, '26.1.2-rc2');
  assert.equal(dev.candidate, '26.1.1-rc2');
  assert.throws(() => snapshotState(dev, [dev]), /verified published/);
  assert.throws(() => snapshotState(dev, [{ ...release, nugetPublished: false }]), /verified published/);
  assert.throws(() => snapshotState({ ...release, installationVersion: release.id }, [release]), /development docs/);
  assert.equal(snapshotState(release, [release]).candidate, release.id);
});
