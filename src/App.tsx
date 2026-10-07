import { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Level } from './components/level/Level';
import level1 from './levels/level1';

function Ball() {
  const ballRef = useRef<THREE.Mesh>(null);

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = true;
          break;

        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = true;
          break;

        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = true;
          break;

        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = false;
          break;

        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = false;
          break;

        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = false;
          break;

        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((_, delta) => {
    if (!ballRef.current) return;

    const speed = 5;

    if (keys.current.forward) {
      ballRef.current.position.z -= speed * delta;
    }

    if (keys.current.backward) {
      ballRef.current.position.z += speed * delta;
    }

    if (keys.current.left) {
      ballRef.current.position.x -= speed * delta;
    }

    if (keys.current.right) {
      ballRef.current.position.x += speed * delta;
    }
  });

  return (
    <mesh ref={ballRef} position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1} />

      <directionalLight
        position={[5, 10, 5]}
        intensity={2}
      />

      <Level segments={level1} />

      <Ball />
    </>
  );
}

export default function App() {
  return (
    <Canvas
      camera={{
        position: [8, 6, 10],
        fov: 50,
      }}
    >
      <Scene />
    </Canvas>
  );
}