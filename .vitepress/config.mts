import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Heretic",
  description: "Fully automatic censorship removal for language models",

  head: [['link', { rel: 'icon', href: 'logo.png' }]],

  appearance: "force-dark",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' }
    ]
  }
})
