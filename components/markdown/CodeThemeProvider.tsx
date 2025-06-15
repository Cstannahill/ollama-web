"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const themeLoaders = {
  light: () => import("prismjs/themes/prism.css"),
  dark: () => import("prismjs/themes/prism-tomorrow.css"),
  funky: () => import("prismjs/themes/prism-funky.css"),
};

type CodeTheme = keyof typeof themeLoaders;

interface CodeThemeContextValue {
  theme: CodeTheme;
  setTheme: (theme: CodeTheme) => void;
}

const CodeThemeContext = createContext<CodeThemeContextValue | undefined>(undefined);

export const CodeThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<CodeTheme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("code-theme") as CodeTheme | null;
    if (stored && themeLoaders[stored]) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    themeLoaders[theme]();
    localStorage.setItem("code-theme", theme);
  }, [theme]);

  return (
    <CodeThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </CodeThemeContext.Provider>
  );
};

export const useCodeTheme = () => {
  const ctx = useContext(CodeThemeContext);
  if (!ctx) throw new Error("useCodeTheme must be used within CodeThemeProvider");
  return ctx;
};
