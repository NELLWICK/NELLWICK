"use client";

import dynamic from "next/dynamic";

const HeroSceneCanvas = dynamic(
  () => import("./HeroSceneCanvas"),
  {
    ssr: false,
    loading: () => <div className="hero-scene-fallback" />,
  }
);

export default function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <HeroSceneCanvas />
    </div>
  );
}