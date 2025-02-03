import { defineNotesConfig } from "vuepress-theme-plume";
import nixNote from "./nix";

export default defineNotesConfig({
  dir: "notes",
  link: "/",
  notes: [nixNote],
});
