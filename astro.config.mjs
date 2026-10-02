// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://devtool.fyi',
  /*
   * Must match how the host serves the build. Astro's directory output puts
   * every route at <route>/index.html, and Cloudflare Pages therefore serves it
   * at <route>/ — redirecting <route> with a 307. Set to 'never' this config
   * emitted slashless canonicals, sitemap entries and links, so every internal
   * click and every crawl cost a redirect.
   */
  trailingSlash: 'always',

  integrations: [
    sitemap({
      // The /go/ pages are redirect stubs for counting outbound clicks. They
      // are noindex, and listing them would invite crawlers to follow every
      // one and inflate the click numbers they exist to measure.
      //
      // The /report/ pages are forms, one per entry. Also noindex, also not
      // content, and a crawler working through them achieves nothing.
      //
      // /search/ is a noindex results page; without a query it is the whole
      // directory as one list, which is exactly the page we decided not to have.
      filter: (page) =>
        !page.includes('/go/') && !page.includes('/report/') && !page.includes('/search/'),
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
