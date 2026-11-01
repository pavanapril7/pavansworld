import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#FFF7ED", 100: "#FFEDD5", 200: "#FED7AA", 400: "#FB923C", 500: "#F97316", 600: "#EA580C", 700: "#C2410C", 900: "#7C2D12" },
        leaf: { 50: "#ECFDF5", 100: "#D1FAE5", 500: "#10B981", 600: "#059669", 700: "#047857" },
        ink: { 900: "#1C1917", 700: "#44403C", 500: "#78716C", 300: "#D6D3D1", 100: "#F5F5F4" },
      },
      fontFamily: { sans: ["\"Plus Jakarta Sans\"", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"] },
      boxShadow: { card: "0 1px 2px rgba(28,25,23,.06), 0 4px 16px rgba(28,25,23,.06)" },
    },
  },
  plugins: [],
};
export default config;
