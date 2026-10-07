type PlatformProps = {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
};

function Platform({
  position,
  size,
  rotation = [0, 0, 0],
  color = 'white',
}: PlatformProps) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export default Platform;