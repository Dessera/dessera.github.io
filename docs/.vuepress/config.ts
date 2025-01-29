import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
import { plumeTheme } from "vuepress-theme-plume";

export default defineUserConfig({
  base: "/",
  lang: "zh-CN",
  title: "Dessera Lab",
  description: "Dessera的个人博客",

  bundler: viteBundler(),

  theme: plumeTheme({
    // 添加您的部署域名
    hostname: "https://dessera.github.io",

    contributors: true,
    changelog: true,

    plugins: {
      git: process.env.NODE_ENV === "production",

      /**
       * Shiki 代码高亮
       * @see https://theme-plume.vuejs.press/config/plugins/code-highlight/
       */
      shiki: {
        languages: [
          "shell",
          "bash",
          "typescript",
          "javascript",
          "c",
          "c++",
          "python",
        ],
        twoslash: true,
        theme: {
          dark: "one-dark-pro",
          light: "one-light",
        },
      },

      /**
       * markdown enhance
       * @see https://theme-plume.vuejs.press/config/plugins/markdown-enhance/
       */
      markdownEnhance: {
        demo: true,
        //   include: true,
        //   chart: true,
        //   echarts: true,
        //   mermaid: true,
        //   flowchart: true,
      },

      /**
       *  markdown power
       * @see https://theme-plume.vuejs.press/config/plugin/markdown-power/
       */
      // markdownPower: {
      //   pdf: true,
      //   caniuse: true,
      //   plot: true,
      //   bilibili: true,
      //   youtube: true,
      //   icons: true,
      //   codepen: true,
      //   replit: true,
      //   codeSandbox: true,
      //   jsfiddle: true,
      //   repl: {
      //     go: true,
      //     rust: true,
      //     kotlin: true,
      //   },
      // },

      /**
       * comments
       * @see https://theme-plume.vuejs.press/guide/features/comments/
       */
      comment: {
        provider: "Giscus",
        comment: true,
        repo: "Dessera/dessera.github.io",
        repoId: "R_kgDOMu79bw",
        category: "Announcements",
        categoryId: "DIC_kwDOMu79b84Cjui1",
      },
    },
  }),
});
