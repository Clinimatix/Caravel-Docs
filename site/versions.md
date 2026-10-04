---
title: Documentation versions
sidebar: false
---

# Documentation versions

Choose documentation that matches the version you use. Each snapshot links to its original framework source, and navigation stays within that snapshot. Reviewed installation corrections are labeled separately and do not change the documented release APIs.

<script setup>
import versions from './versions.json'
import { withBase } from 'vitepress'
</script>

<ul><li v-for="version in versions" :key="version.id"><a :href="withBase(`/v/${version.id}/overview.html`)">{{ version.label }}</a> — {{ version.released ? (version.id.includes('-rc') ? 'Public Preview snapshot' : (version.id.includes('-') ? 'Milestone prerelease snapshot' : 'Release snapshot')) : `Unreleased snapshot; source version ${version.candidate}` }}</li></ul>

<p v-if="!versions.some(version => version.released)">There are no published release snapshots yet. Development guidance may change before the first stable release.</p>

## Public previews

Caravel release candidates are **public previews**. The package version and Git tag retain the `-rcN` suffix; for example, Public Preview 1 is `26.1.0-rc1`. Each preview has its own source and documentation snapshot. Use previews to evaluate the framework and test integrations ahead of stable release, with a rollback plan.

<a href="/releases/">Browse releases and preview notes →</a>

## Release families

Caravel uses `YY.Release.Patch` versions, such as `26.1.0`, with milestone (`-m1`) and release candidate (`-rc1`) stages. Stable compatibility applies within a release family. See [versions and releases](v/26.1.0-rc1/release-policy.md) for the complete policy.
