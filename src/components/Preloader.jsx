"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const timer = window.setTimeout(
      () => setVisible(false),
      reducedMotion ? 100 : 1050
    );

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="preloader" role="status" aria-label="Loading NELLWICK">
      <div className="preloader-inner">
        <div className="preloader-symbol">
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <circle cx="10" cy="10" r="3.2" />
            <circle cx="21.5" cy="9.5" r="3.2" />
            <circle cx="7.5" cy="18" r="3" />
            <circle cx="24" cy="17.5" r="3" />
            <path d="M15.8 14.2c-4.7 0-8.1 4.2-7.2 8.2.5 2.1 2.5 3 4.2 1.7l3-2.2 3.1 2.2c1.7 1.3 3.7.4 4.2-1.7.9-4-2.6-8.2-7.3-8.2Z" />
          </svg>
        </div>

        <div className="preloader-wordmark">NELLWICK</div>
        <div className="preloader-caption">
          Thoughtful pet essentials
        </div>

        <div className="preloader-track">
          <span />
        </div>

        <div className="preloader-bottom">
          MADE FOR LIFE WITH PETS
        </div>
      </div>
    </div>
  );
}