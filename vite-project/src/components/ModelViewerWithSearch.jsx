import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

function MarinRobotShark(props) {
  const gltf = useGLTF("/marin_the_robot_shark_low_poly/scene.gltf");
  const modelRef = useRef();

  // Mouse-follow logic
  useFrame(({ mouse }) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = mouse.x * Math.PI / 4;
      modelRef.current.rotation.x = -mouse.y * Math.PI / 8;
    }
  });

  return <primitive ref={modelRef} object={gltf.scene} {...props} />;
}

export default function ModelViewerWithSearch() {
  // For loading fallback
  const [modelLoaded, setModelLoaded] = useState(false);

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* Search Bar Overlay - always on top, clickable */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: 400,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          padding: 12,
          pointerEvents: "auto",
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

      {/* 3D Model Canvas - pointer events none so it never blocks UI */}
      <div style={{ width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 1, position: "absolute", top: 0, left: 0 }}>
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense fallback={null}>
            <MarinRobotShark position={[0, -1, 0]} />
          </Suspense>
        </Canvas>
        {!modelLoaded && (
          <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#333', background: 'rgba(255,255,255,0.8)', padding: 20, borderRadius: 8, zIndex: 2000}}>
            Loading 3D Model...
          </div>
        )}
      </div>
    </div>
  );
}

// If you get a warning about missing GLTF loader, add this at the top of your app:
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// useGLTF.preload('/marin_the_robot_shark_low_poly/scene.gltf'); 