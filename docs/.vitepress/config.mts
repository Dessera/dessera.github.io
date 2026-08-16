import { defineConfig } from "vitepress";
import { blogTheme } from "./blog-theme";

export default defineConfig({
    extends: blogTheme,
    lang: "zh-cn",
    title: "Dessera Archives",
    description: "My random notes",
    head: [["link", { rel: "icon", href: "/favicon.ico" }]],
    themeConfig: {
        outline: {
            level: [2, 3],
            label: "目录",
        },
        returnToTopLabel: "回到顶部",
        sidebarMenuLabel: "相关文章",
        lastUpdatedText: "上次更新于",

        logo: "/logo.jpg",
        nav: [
            { text: "首页", link: "/" },
            { text: "关于作者", link: "/about" },
        ],
        socialLinks: [
            {
                icon: "github",
                link: "https://github.com/Dessera",
            },
        ],
    },
});
