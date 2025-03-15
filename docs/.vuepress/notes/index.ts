import { defineNotesConfig } from "vuepress-theme-plume";
import nixNote from "./nix";
import oslabNote from "./oslab";

export default defineNotesConfig({
  dir: "notes",
  link: "/",
  notes: [nixNote, oslabNote],
});
