<script setup>
import { computed } from 'vue';
import { useData, withBase } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import versions from '../../versions.json';
const { page, frontmatter } = useData();
const current = computed(() => versions.find(v => page.value.relativePath.startsWith(`v/${v.id}/`)));
const slug = computed(() => page.value.relativePath.split('/').at(-1).replace(/\.md$/, ''));
function changeVersion(event) {
  const version = versions.find(v => v.id === event.target.value);
  const target = version.navigation.some(group => group.items.some(p => p.slug === slug.value)) ? slug.value : 'overview';
  window.location.assign(withBase(`/v/${event.target.value}/${target}.html`));
}
</script>
<template>
  <DefaultTheme.Layout>
    <template #doc-before>
      <div v-if="current" class="version-banner">
        <div><strong>{{ current.released ? current.label : 'Development documentation' }}</strong><span>{{ current.released ? (current.id.includes('-rc') ? 'Public Preview · not stable' : (current.id.includes('-') ? 'Milestone prerelease' : 'Release snapshot')) : `Unreleased snapshot · source version ${current.candidate}` }}</span></div>
        <label>Version <select :value="current.id" @change="changeVersion"><option v-for="version in versions" :key="version.id" :value="version.id">{{ version.label }}</option></select></label>
      </div>
      <div v-if="frontmatter.availabilityCorrection" class="custom-block info">
        <p class="custom-block-title">NuGet installation update</p>
        <p>These RC1 packages are now available on nuget.org. Installation guidance reflects a <a :href="`https://github.com/Clinimatix/Caravel/commit/${frontmatter.availabilityCorrection}`">reviewed documentation correction</a>; the release version, API behavior and package payloads are unchanged.</p>
      </div>
      <div v-if="frontmatter.statusCorrection" class="custom-block info">
        <p class="custom-block-title">Release status update</p>
        <p>This page includes a <a :href="`https://github.com/Clinimatix/Caravel/commit/${frontmatter.statusCorrection}`">reviewed correction</a> reflecting Public Preview 1 publication. Its release scope and API contracts are unchanged.</p>
      </div>
    </template>
    <template #doc-footer-before>
      <p v-if="current && frontmatter.sourcePath" class="source-link"><a :href="`https://github.com/Clinimatix/Caravel/blob/${current.commit}/${frontmatter.sourcePath}`">View this page’s framework source ↗</a></p>
    </template>
  </DefaultTheme.Layout>
</template>
