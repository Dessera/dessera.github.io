import { defineNoteConfig, defineNotesConfig } from "vuepress-theme-plume";

const nixNote = defineNoteConfig({
  dir: "nix",
  link: "/nix",
  sidebar: ["", "文章简介"],
});

export const notes = defineNotesConfig({
  dir: "notes",
  link: "/",
  notes: [nixNote],
});
