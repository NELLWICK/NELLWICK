"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  MeshDistortMaterial,
} from "@react-three/drei";

function OrganicCore() {
  const group = useRef(null);

  useFrame((state, delta) => {
    if (!group.current) return;

    group.current.rotation.y += delta * 0.12;

    group.current.rotation.x +=
      (state.pointer.y * 0.13 - group.current.rotation.x) *
      delta *
      1.5;

    group.current.rotation.z +=
      (state.pointer.x * 0.1 - group.current.rotation.z) *
      delta *
      1.5;
  });

  return (
    <group ref={group}>
      <Float
        speed={1.4}
        rotationIntensity={0.22}
        floatIntensity={0.45}
      >
        <mesh>
          <icosahedronGeometry args={[0.85, 7]} />
          <MeshDistortMaterial
            color="#A8F0C6"
            emissive="#347B56"
            emissiveIntensity={0.8}
            roughness={0.24}
            metalness={0.22}
            distort={0.2}
            speed={1.5}
          />
        </mesh>
      </Float>

      <mesh rotation={[1.05, 0.35, 0.25]}>
        <torusGeometry args={[1.32, 0.012, 10, 120]} />
        <meshBasicMaterial
          color="#C4FFDA"
          transparent
          opacity={0.68}
        />
      </mesh>

      <mesh rotation={[0.4, 1.1, 1.05]}>
        <torusGeometry args={[1.53, 0.009, 10, 120]} />
        <meshBasicMaterial
          color="#D8C4A0"
          transparent
          opacity={0.4}
        />
      </mesh>

      <mesh rotation={[1.7, 0.2, 0.7]}>
        <torusGeometry args={[1.72, 0.006, 8, 120]} />
        <meshBasicMaterial
          color="#779B88"
          transparent
          opacity={0.58}
        />
      </mesh>

      <mesh position={[1.48, 0.62, 0.1]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshBasicMaterial color="#D8C4A0" />
      </mesh>

      <mesh position={[-1.35, -0.72, 0.2]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#A8F0C6" />
      </mesh>

      <mesh position={[0.45, 1.5, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color="#C4FFDA" />
      </mesh>
    </group>
  );
}

export default function HeroSceneCanvas() {
  return (
    <Canvas
      dpr={1}
      camera={{ position: [0, 0, 5.2], fov: 43 }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      }}
      frameloop="always"
    >
      <ambientLight intensity={1.15} />

      <pointLight
        position={[2, 2, 3]}
        color="#A8F0C6"
        intensity={9}
        distance={8}
      />

      <pointLight
        position={[-3, -2, 1]}
        color="#D8C4A0"
        intensity={3}
        distance={7}
      />

      <OrganicCore />
    </Canvas>
  );
}