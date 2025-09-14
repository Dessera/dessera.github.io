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

    copyright: "CC-BY-SA-4.0",
    contributors: true,
    changelog: true,

    markdown: {
      demo: true,
      mermaid: true,
    },

    codeHighlighter: {
      langs: [
        "shell",
        "bash",
        "typescript",
        "javascript",
        "c",
        "c++",
        "python",
        "nix",
        "toml",
        "rust",
        "asm",
      ],
      twoslash: true,
      themes: {
        dark: "one-dark-pro",
        light: "one-light",
      },
    },

    plugins: {
      git: process.env.NODE_ENV === "production",

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
