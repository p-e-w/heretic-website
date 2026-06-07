import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Heretic",
  description: "Fully automatic censorship removal for language models",

  head: [['link', { rel: 'icon', href: 'logo.png' }]],

  cleanUrls: true,

  appearance: "force-dark",

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.png',

    nav: [
      { text: 'Tutorial', link: '/tutorial' },
      { text: 'Installation', link: '/installation' },
      { text: 'Configuration', link: '/configuration' },
      { text: 'Security', link: '/security' },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/p-e-w/heretic' },
      { icon: 'huggingface', link: 'https://huggingface.co/heretic-org' },
      { icon: 'discord', link: 'https://discord.gg/gdXc48gSyT' },
      { icon: 'matrix', link: 'https://matrix.to/#/#heretic:matrix.org' },
    ],

    search: {
      provider: 'local'
    },

    footer: {
      message: 'Heretic is Free Software, released under the terms of the GNU Affero General Public License version 3 or later',
      copyright: 'Copyright © 2025-2026 Philipp Emanuel Weidmann + contributors'
    },
  }
})
