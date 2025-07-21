import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

function MarinRobotShark(props) {
  const gltf = useGLTF("/marin_the_robot_shark_low_poly/scene.gltf");
  return <primitive object={gltf.scene} {...props} />;
}

export default function ModelViewerWithSearch() {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", background: "#f9f9f9" }}>
      {/* Left: 3D Model viewer, no pointer events, no overlays */}
      <div style={{ flex: '0 0 40%', height: '100vh', pointerEvents: 'none', background: '#f9f9f9', position: 'relative' }}>
        <Canvas 
          camera={{ position: [0, 2, 8], fov: 50 }} 
          style={{ width: '100%', height: '100%', position: 'absolute', left: 0, top: 0 }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Suspense fallback={null}>
            <MarinRobotShark position={[0, -1, 0]} rotation={[0, Math.PI / 4, 0]} />
          </Suspense>
        </Canvas>
      </div>

      {/* Right: Search bar, always clickable, no overlap */}
      <div style={{ 
        flex: 1, 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'flex-start', 
        alignItems: 'center', 
        background: '#fff',
        paddingTop: '2rem',
        position: 'relative',
        zIndex: 2
      }}>
        <div
          style={{
            width: '80%',
            maxWidth: 400,
            background: "rgba(255,255,255,1)",
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
              padding: 12,
              borderRadius: 4,
              border: "1px solid #ccc",
              fontSize: 16,
              outline: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// If you get a warning about missing GLTF loader, add this at the top of your app:
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// useGLTF.preload('/marin_the_robot_shark_low_poly/scene.gltf'); 