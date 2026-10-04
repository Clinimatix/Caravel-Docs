export const groups = [
  ['Start here', [['overview', 'Overview', 'README.md'], ['getting-started', 'Getting started', 'docs/GETTING-STARTED.md'], ['upgrading', 'Upgrading'], ['index', 'All guides', 'docs/README.md']]],
  ['Application foundation', [['configuration', 'Configuration'], ['development', 'Development sessions'], ['hosting', 'Hosting']]],
  ['Data with Clarion', [['clarion', 'Models and queries'], ['database-providers', 'Database providers'], ['bosun-data', 'Migrations and seeders']]],
  ['Authentication', [['authentication', 'Local accounts'], ['oidc-authentication', 'OpenID Connect'], ['service-authentication', 'Bearer-token APIs'], ['windows-authentication', 'Windows authentication']]],
  ['Application services', [['events', 'Events'], ['queues', 'Queues and workers'], ['mail', 'Mail'], ['notifications', 'Mail and SMS notifications'], ['scheduling', 'Scheduling'], ['storage', 'Local storage'], ['azure-storage', 'Azure Blob storage'], ['caching', 'Caching'], ['observability', 'Observability']]],
  ['Tools and examples', [['bosun-services', 'Service generators'], ['backend-sample', 'Backend walkthrough'], ['authorized-commands', 'Authorized commands']]],
  ['Project reference', [['roadmap', 'Design and roadmap'], ['release-policy', 'Versions and releases'], ['testing', 'Testing'], ['changelog', 'Changelog', 'CHANGELOG.md'], ['contributing', 'Contributing', 'CONTRIBUTING.md'], ['security', 'Security', 'SECURITY.md']]]
];
export const pages = groups.flatMap(([, items]) => items.map(([slug, title, source]) => ({ slug, title, source: source ?? `docs/${slug.toUpperCase()}.md` })));
