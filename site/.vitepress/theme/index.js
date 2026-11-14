import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import './style.css';
export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ siteData }) {
    // Keep executable search behavior in the theme rather than serialized page data.
    // This avoids VitePress reviving a configuration function with dynamic evaluation.
    if (typeof window === 'undefined') return;
    siteData.value.themeConfig.search.options = { miniSearch: { searchOptions: {
      filter: result => {
        const version = window.location.pathname.match(/\/v\/([^/]+)\//)?.[1];
        return !version || result.id.includes(`/v/${version}/`);
      }
    } } };
  }
};
