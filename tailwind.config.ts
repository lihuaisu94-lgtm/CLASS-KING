import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 马卡龙色系
        ink: "#4A5568",              // 深灰蓝 - 主文字
        bg: "#FAF9F6",               // 奶油白 - 页面背景
        cardBg: "#FFFFFF",           // 纯白 - 卡片背景
        primary: "#E8B4B8",          // 玫瑰粉 - 主色
        primaryDark: "#D4949A",      // 莓果粉 - 主色深
        primaryLight: "#FFF0F0",     // 樱花粉 - 主色浅
        textSecondary: "#718096",    // 灰紫 - 次要文字
        textTertiary: "#A0AEC0",     // 浅灰紫 - 三级文字
        accent: "#B8E6D5",           // 薄荷绿 - 强调色
        warning: "#F6D5A8",          // 杏黄 - 警告色
        lavender: "#D4C5E2",         // 薰衣草紫 - 装饰色
        peach: "#FFD4C4",            // 蜜桃色 - 装饰色
      },
      fontFamily: {
        sans: ["'Noto Sans SC'", "'PingFang SC'", "'Microsoft YaHei'", "sans-serif"]
      },
      boxShadow: {
        float: "0 2px 16px rgba(232, 180, 184, 0.15)",
        floatHover: "0 4px 24px rgba(232, 180, 184, 0.25)",
        soft: "0 1px 8px rgba(0, 0, 0, 0.06)"
      },
      lineHeight: {
        'relaxed-plus': '1.8'
      }
    }
  },
  plugins: []
};

export default config;
