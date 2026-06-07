import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202A",
        paper: "#F8FAFC",
        line: "#D9E2EC",
        accent: "#1D7A8C",
        success: "#237A4B",
        warning: "#A65F00",
        danger: "#B42318"
      }
    }
  },
  plugins: []
};

export default config;
