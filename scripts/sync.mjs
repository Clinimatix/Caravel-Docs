import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, groups } from './catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
export function rewriteLink(href, source, version, commit) {
  const canonical = 'https://github.com/Clinimatix/Caravel/blob/main/';
  const absoluteSource = href.startsWith(canonical);
  if (!absoluteSource && /^(?:[a-z]+:|\/|#)/i.test(href)) return href;
  const [pathname, fragment] = (absoluteSource ? href.slice(canonical.length) : href).split('#');
  const path = absoluteSource ? pathname : posix.normalize(posix.join(posix.dirname(source), pathname));
  const page = pages.find(item => item.source === path);
  const target = page ? `/v/${version}/${page.slug}` : `https://github.com/Clinimatix/Caravel/blob/${commit}/${path}`;
  return target + (fragment ? `#${fragment}` : '');
}

export function sync(repo, ref, version = 'dev', outputRoot = root) {
  if (!/^(dev|\d{2}\.\d+\.\d+(?:-(?:m|rc)\d+)?)$/.test(version)) throw new Error('Use dev or an exact Caravel version.');
  const git = (...args) => execFileSync('git', ['-C', resolve(repo), ...args], { encoding: 'utf8' }).trimEnd();
  const commit = git('rev-parse', '--verify', `${ref}^{commit}`);
  if (version !== 'dev' && git('rev-parse', '--verify', `refs/tags/v${version}^{commit}`) !== commit) throw new Error('A release snapshot must match its version tag.');
  const folder = resolve(outputRoot, 'site/v', version);
  if (version !== 'dev' && existsSync(folder)) throw new Error('Release snapshot already exists; update guidance deliberately instead of overwriting it.');
  // Read every source first; a missing document must not leave a partial snapshot.
  const documents = pages.map(page => {
    const markdown = git('show', `${commit}:${page.source}`);
    const body = markdown.replace(/\]\(([^\s)]+)\)/g, (_, href) => `](${rewriteLink(href, page.source, version, commit)})`);
    return [page.slug, `---\ntitle: ${JSON.stringify(page.title)}\nsourcePath: ${page.source}\n---\n\n${body}\n`];
  });
  const manifestPath = resolve(outputRoot, 'site/versions.json');
  const versions = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : [];
  const props = git('show', `${commit}:Directory.Build.props`);
  const candidate = props.match(/<Version>([^<]+)<\/Version>/)?.[1];
  if (!candidate) throw new Error('Framework version not found.');
  if (version !== 'dev' && candidate !== version) throw new Error('Version tag and framework package version must agree.');
  mkdirSync(folder, { recursive: true });
  for (const [slug, content] of documents) writeFileSync(resolve(folder, `${slug}.md`), content);
  const navigation = groups.map(([text, items]) => ({ text, items: items.map(([slug, title]) => ({ slug, title })) }));
  const entry = { id: version, label: version === 'dev' ? 'Development' : version, candidate, commit, released: version !== 'dev', navigation };
  writeFileSync(manifestPath, JSON.stringify([entry, ...versions.filter(v => v.id !== version)], null, 2) + '\n');
  console.log(`Imported ${documents.length} pages for ${version} from ${commit}.`);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [repo, ref, version] = process.argv.slice(2);
  if (!repo || !ref) throw new Error('Usage: npm run sync -- <framework-checkout> <commit-or-tag> [dev|version]');
  sync(repo, ref, version);
}
