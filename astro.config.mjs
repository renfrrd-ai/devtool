// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://devtool.fyi',
  trailingSlash: 'never',

  integrations: [
    sitemap({
      // The /go/ pages are redirect stubs for counting outbound clicks. They
      // are noindex, and listing them would invite crawlers to follow every
      // one and inflate the click numbers they exist to measure.
      filter: (page) => !page.includes('/go/'),
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
