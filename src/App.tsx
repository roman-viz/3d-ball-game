import { Canvas } from '@react-three/fiber';
import Scene from './components/scene/Scene';

export default function App() {
  return (
    <Canvas
      camera={{
        position: [4.5, 7.5, 10],
        fov: 55,
      }}
    >
      <Scene />
    </Canvas>
  );
}
