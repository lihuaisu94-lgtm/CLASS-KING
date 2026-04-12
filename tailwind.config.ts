import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#2D2D2D",
        bg: "#F2F2F2",
        cardBg: "#FFFFFF",
        primary: "#A52A2A",
        primaryDark: "#8B1A1A",
        primaryLight: "#FFF5F5",
        textSecondary: "#5A5A5A",
        textTertiary: "#8C8C8C"
      },
      fontFamily: {
        sans: ["'Noto Sans SC'", "'PingFang SC'", "'Microsoft YaHei'", "sans-serif"]
      },
      boxShadow: {
        float: "0 2px 12px rgba(0, 0, 0, 0.08)",
        floatHover: "0 4px 20px rgba(0, 0, 0, 0.12)"
      },
      lineHeight: {
        'relaxed-plus': '1.8'
      }
    }
  },
  plugins: []
};

export default config;
