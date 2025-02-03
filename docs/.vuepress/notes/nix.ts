import { defineNoteConfig } from "vuepress-theme-plume";

export default defineNoteConfig({
  dir: "nix",
  link: "/nix",
  sidebar: ["", "文章简介", "安装NixOS"],
});
