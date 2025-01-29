import { defineNavbarConfig } from "vuepress-theme-plume";

export const navbar = defineNavbarConfig([
  { text: "首页", link: "/", icon: "mdi:home" },
  { text: "博客", link: "/blog/", icon: "mdi:bookshelf" },
  { text: "标签", link: "/blog/tags/", icon: "mdi:tags" },
  { text: "归档", link: "/blog/archives/", icon: "mdi:archive" },
  { text: "友情链接", link: "/friends/", icon: "mdi:account-group" },
  {
    text: "笔记",
    icon: "mdi:notebook",
    items: [{ text: "[WIP]nix教程", link: "/notes/nix/README.md" }],
  },
]);
