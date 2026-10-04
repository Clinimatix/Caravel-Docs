import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function contentIssues(markdown, { released, nugetPublished, candidate }) {
  const issues = [];
  if (released && /first release candidate will come|before a release candidate|until the packages are published/i.test(markdown))
    issues.push('Published release described as future work');
  if (nugetPublished && /not on nuget\.org|aren.t on nuget\.org|not through nuget\.org|before nuget\.org distribution/i.test(markdown))
    issues.push('Published NuGet packages described as unavailable');
  for (const match of markdown.matchAll(/dotnet (?:tool install|add package)[^\n]*Clinimatix\.Caravel\.[^\n]*--version\s+(\d{2}\.\d+\.\d+(?:-(?:rc|m)\d+)?)/g))
    if (match[1] !== candidate) issues.push(`Install version ${match[1]} differs from ${candidate}`);
  return issues;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const site = new URL('../site/', import.meta.url);
  const versions = JSON.parse(readFileSync(new URL('versions.json', site), 'utf8'));
  const failures = [];
  for (const version of versions) {
    const published = versions.find(v => v.released && v.id === version.candidate);
    const state = { candidate: version.candidate, released: !!published, nugetPublished: published?.nugetPublished };
    for (const { slug } of version.navigation.flatMap(group => group.items)) {
      const path = `v/${version.id}/${slug}.md`;
      failures.push(...contentIssues(readFileSync(new URL(path, site), 'utf8'), state).map(issue => `${path}: ${issue}`));
    }
  }
  if (failures.length) throw new Error(failures.join('\n'));
  console.log(`Release-state content checks passed for ${versions.length} documentation snapshots.`);
}
