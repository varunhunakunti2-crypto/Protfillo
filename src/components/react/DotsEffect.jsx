import React, { useEffect, useRef, useState } from "react";
import { DotSwarm } from "dots-swarm";

// Canvas colors cannot resolve CSS variables, so each theme maps to a solid value.
const THEME_COLORS = {
  dark: "#eeeeee",
  light: "#0f172a",
};

const readThemeColor = () =>
  document.documentElement.getAttribute("data-theme") === "light"
    ? THEME_COLORS.light
    : THEME_COLORS.dark;

export function DotsEffect({
  shape = "atom",
  count = 900,
  label = "Atom particle animation",
  style = { width: "100%", height: 320 },
  speed = 1,
  dotSize = 1.25,
  spread = 1,
  choreography,
  transitionDuration = 2.4,
  interactive = false,
  color: customColor,
}) {
  const hostRef = useRef(null);
  const [color, setColor] = useState(() => customColor || readThemeColor());
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (customColor) {
      setColor(customColor);
      return undefined;
    }
    const root = document.documentElement;
    const syncTheme = () => setColor(readThemeColor());
    syncTheme();

    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setReducedMotion(motionQuery.matches);
    syncMotion();
    motionQuery.addEventListener("change", syncMotion);

    return () => {
      themeObserver.disconnect();
      motionQuery.removeEventListener("change", syncMotion);
    };
  }, [customColor]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof IntersectionObserver === "undefined") return undefined;

    const visibility = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0 }
    );
    visibility.observe(host);
    return () => visibility.disconnect();
  }, []);

  return (
    <div ref={hostRef} style={{ width: "100%", height: "100%", minHeight: "100px", ...style }}>
      <DotSwarm
        shape={shape}
        count={count}
        color={color}
        speed={speed}
        dotSize={dotSize}
        spread={spread}
        choreography={choreography}
        transitionDuration={transitionDuration}
        interactive={interactive}
        paused={paused}
        reducedMotion={reducedMotion}
        label={label}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
