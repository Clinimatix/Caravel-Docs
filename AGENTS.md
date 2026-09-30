# Documentation contributors

- `site/` is the public VitePress site. Keep prose useful to developers and distinguish available features from planned work.
- `site/v/` contains imported framework snapshots. Correct framework guidance in its source repository, then use the documented import command. Review the resulting diff.
- Keep release snapshots tied to their original framework version. Never silently replace an existing snapshot with current development documentation.
- Use the supplied Clinimatix assets unchanged. Preserve font licenses.
- Run `npm test` and `npm run build`; inspect navigation, search and small-screen rendering after theme changes.
- Keep generated build output out of source control.
