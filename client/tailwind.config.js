import animate from "tailwindcss-animate";
/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.tsx"];
export const theme = {
  extend: {
    animation: {
      "fade-in": "fadeIn 0.4s ease-in-out forwards",
      "fade-in-up": "fade-in-up 0.4s ease-out forwards",
      "fade-in-up-slight": "fade-in-up-slight 0.4s ease-in-out forwards",
      "fade-in-up-scale": "fade-in-up-scale 0.4s ease-out forwards",
    },
    keyframes: {
      fadeIn: {
        "0%": { opacity: 0 },
        "100%": { opacity: 1 },
      },
      "fade-in-up": {
        "0%": {
          opacity: "0",
          transform: "translateY(12px)",
        },
        "100%": {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
      "fade-in-up-slight": {
        "0%": {
          opacity: "0",
          transform: "translateY(3px)",
        },
        "100%": {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
      "fade-in-up-scale": {
        "0%": {
          opacity: "0",
          transform: "translateY(8px) scale(0.97)",
        },
        "100%": {
          opacity: "1",
          transform: "translateY(0) scale(1)",
        },
      },
    },
    fontFamily: {
      inter: ["Inter", "sans-serif"],
    },
    colors: {
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
      highlight: "hsl(var(--highlight))",
    },
    borderRadius: {
      lg: `var(--radius)`,
      md: `calc(var(--radius) - 2px)`,
      sm: "calc(var(--radius) - 4px)",
    },
  },
};
export const plugins = [animate];
