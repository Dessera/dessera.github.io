import { getThemeConfig } from "@sugarat/theme/node";

const blogTheme = getThemeConfig({
    article: {
        readingTime: true,
    },
    footer: {
        copyright: "Apache-2.0 License | CC-BY-SA-4.0 | Dessera",
    },
    comment: {
        type: "giscus",
        options: {
            repo: "Dessera/dessera.github.io",
            repoId: "R_kgDOMu79bw",
            category: "Announcements",
            categoryId: "DIC_kwDOMu79b84Cjui1",
            inputPosition: "top",
        },
        mobileMinify: true,
    },
    themeColor: "el-blue",
    author: "Dessera",
});

export { blogTheme };
