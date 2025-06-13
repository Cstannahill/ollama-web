"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export const themeConfig = {
  dark: {
    gradients: {
      primary: "linear-gradient(135deg, #00ff88 0%, #00b4d8 100%)",
      code: "linear-gradient(180deg, #141b2d 0%, #0a0e1a 100%)",
      accent: "linear-gradient(90deg, #c792ea 0%, #82aaff 100%)",
    },
    glass: {
      background: "rgba(20, 27, 45, 0.7)",
      backdropFilter: "blur(20px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
  },
  light: {
    gradients: {
      primary: "linear-gradient(135deg, #00b4d8 0%, #00ff88 100%)",
      code: "linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)",
      accent: "linear-gradient(90deg, #82aaff 0%, #c792ea 100%)",
    },
    glass: {
      background: "rgba(255, 255, 255, 0.7)",
      backdropFilter: "blur(12px) saturate(180%)",
      border: "1px solid rgba(0,0,0,0.1)",
    },
  },
} as const;

type Theme = keyof typeof themeConfig;
interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
