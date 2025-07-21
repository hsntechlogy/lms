import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

function MarinRobotShark(props) {
  const gltf = useGLTF("/marin_the_robot_shark_low_poly/scene.gltf");
  // TODO: Add animation logic here if your model has animation clips or bones
  return <primitive object={gltf.scene} {...props} />;
}

export default function ModelViewerWithSearch() {
  const controlsRef = useRef();

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      {/* Search Bar Overlay */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          width: 400,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: 12,
        }}
      >
        <input
          type="text"
          placeholder="Search..."
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 4,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
      </div>

      {/* 3D Model Canvas */}
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <MarinRobotShark position={[0, -1, 0]} />
        {/* OrbitControls with rotation disabled */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={false}
          enablePan={true}
          enableZoom={true}
        />
      </Canvas>
    </div>
  );
}

// If you get a warning about missing GLTF loader, add this at the top of your app:
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// useGLTF.preload('/marin_the_robot_shark_low_poly/scene.gltf'); 