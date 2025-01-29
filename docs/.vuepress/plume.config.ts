import { defineThemeConfig } from "vuepress-theme-plume";
import { navbar } from "./navbar";
import { notes } from "./notes";

/**
 * @see https://theme-plume.vuejs.press/config/basic/
 */
export default defineThemeConfig({
  logo: "https://theme-plume.vuejs.press/plume.png",

  // docsRepo: "https://github.com/Dessera/dessera-blog",
  // docsDir: "docs",

  appearance: true,

  profile: {
    avatar: "/avatar.jpg",
    name: "Dessera Lab",
    description: "Dessera的个人博客",
    circle: true,
    location: "China",
    organization: "吉林大学",
  },

  copyright: {
    license: "CC-BY-SA-4.0",
  },

  navbar,
  notes,
  social: [{ icon: "github", link: "https://github.com/Dessera" }],
});
