import { defineConfig } from 'vitepress';
import { readFileSync } from 'node:fs';
const versions = JSON.parse(readFileSync(new URL('../versions.json', import.meta.url), 'utf8'));
const defaultVersion = versions.find(version => version.released)?.id ?? 'dev';
const sidebarFor = version => versions.find(v => v.id === version).navigation.map(({ text, items }) => ({ text, collapsed: false, items: items.map(({ slug, title }) => ({ text: title, link: `/v/${version}/${slug}` })) }));
export default defineConfig({
  base: '/docs/',
  title: 'Clinimatix Caravel',
  description: 'Guides and reference for building applications with Clinimatix Caravel on native .NET foundations.',
  cleanUrls: false,
  appearance: false,
  lastUpdated: false,
  head: [['link', { rel: 'icon', href: '/docs/assets/clinimatix-mark.png' }]],
  themeConfig: {
    logo: { src: '/assets/clinimatix-logo.png', alt: 'Clinimatix' },
    siteTitle: 'Caravel',
    logoLink: { link: '/', target: '_self' },
    nav: [{ text: 'Documentation', link: '/' }, { text: 'Versions', link: '/versions' }, { text: 'Contribute', link: 'https://github.com/Clinimatix/Caravel-Docs' }],
    socialLinks: [{ icon: 'github', link: 'https://github.com/Clinimatix/Caravel' }],
    search: { provider: 'local', options: { miniSearch: { searchOptions: {
      filter: result => {
        const version = typeof window !== 'undefined' && window.location.pathname.match(/\/v\/([^/]+)\//)?.[1];
        return !version || result.id.includes(`/v/${version}/`);
      }
    } } } },
    outline: { label: 'On this page', level: [2, 3] },
    sidebar: { '/': sidebarFor(defaultVersion), ...Object.fromEntries(versions.map(version => [`/v/${version.id}/`, sidebarFor(version.id)])) },
    footer: { message: 'Open source under the MIT license.', copyright: 'Copyright © Clinimatix, LLC' }
  }
});
