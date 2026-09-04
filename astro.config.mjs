// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://devtool.fyi',
  trailingSlash: 'never',

  integrations: [
    sitemap({
      // One page, and it changes when a tool is added — which is rarely, but
      // matters enough to re-crawl when it happens.
      changefreq: 'monthly',
      priority: 1.0,
      lastmod: new Date(),
    }),
  ],

  build: {
    // One route, one stylesheet — no reason to split it into <style> tags.
    inlineStylesheets: 'never',
  },
});
