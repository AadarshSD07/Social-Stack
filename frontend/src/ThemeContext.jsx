import { createContext, useEffect, useState } from "react";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: light)"
      ).matches;
      if (prefersDark) {
        setTheme("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      }
    }
  }, []);

  const applyThemeWithTransition = async (nextTheme, thumbEl) => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!document.startViewTransition || reducedMotion || !thumbEl) {
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("theme", nextTheme);
      return;
    }

    const rect = thumbEl.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
      document.documentElement.dataset.theme = nextTheme;
      localStorage.setItem("theme", nextTheme);
    });

    await transition.ready;

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration: 600,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)"
      }
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, applyThemeWithTransition  }}>
      {children}
    </ThemeContext.Provider>
  );
};
