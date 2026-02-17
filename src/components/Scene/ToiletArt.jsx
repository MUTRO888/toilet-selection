import { useMemo } from 'react'

const porcelainMaterial = (
    <meshStandardMaterial
        color="#F0F0F0"
        metalness={0.05}
        roughness={0.28}
        envMapIntensity={0.8}
    />
)

const goldMaterial = (
    <meshStandardMaterial
        color="#FFD700"
        metalness={1.0}
        roughness={0.2}
        envMapIntensity={1.5}
    />
)

export default function ToiletArt() {
    const tank = useMemo(() => (
        <group>
            <mesh position={[0, 1.4, -0.6]} castShadow receiveShadow>
                <boxGeometry args={[1.2, 1.0, 0.5]} />
                {porcelainMaterial}
            </mesh>
            <mesh position={[0, 1.95, -0.6]} castShadow>
                <boxGeometry args={[1.25, 0.08, 0.55]} />
                {porcelainMaterial}
            </mesh>
            <mesh position={[0.3, 1.99, -0.6]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
                {goldMaterial}
            </mesh>
            <mesh position={[-0.3, 1.99, -0.6]} castShadow>
                <cylinderGeometry args={[0.06, 0.06, 0.05, 32]} />
                {goldMaterial}
            </mesh>
            <mesh position={[0, 1.6, -0.34]} castShadow>
                <boxGeometry args={[1.22, 0.02, 0.02]} />
                {goldMaterial}
            </mesh>
            <mesh position={[0, 1.2, -0.34]} castShadow>
                <boxGeometry args={[1.22, 0.02, 0.02]} />
                {goldMaterial}
            </mesh>
        </group>
    ), [])

    const base = useMemo(() => (
        <group>
            <mesh position={[0, 0.4, 0.1]} castShadow receiveShadow>
                <cylinderGeometry args={[0.5, 0.6, 0.8, 64]} />
                {porcelainMaterial}
            </mesh>
            <mesh position={[0, 0.05, 0.1]} castShadow receiveShadow>
                <cylinderGeometry args={[0.65, 0.65, 0.1, 64]} />
                {porcelainMaterial}
            </mesh>
        </group>
    ), [])

    const seat = useMemo(() => (
        <group>
            <mesh position={[0, 0.9, 0.25]} castShadow receiveShadow>
                <cylinderGeometry args={[0.75, 0.4, 0.7, 64]} />
                {porcelainMaterial}
            </mesh>
            <mesh position={[0, 1.25, 0.25]} castShadow>
                <torusGeometry args={[0.55, 0.12, 32, 64]} />
                {porcelainMaterial}
            </mesh>
            <mesh position={[0, 1.28, 0.3]} castShadow>
                <torusGeometry args={[0.7, 0.08, 32, 64]} />
                <meshStandardMaterial
                    color="#F5F5F5"
                    metalness={0.05}
                    roughness={0.2}
                />
            </mesh>
            <mesh position={[0, 1.32, 0.3]} castShadow>
                <torusGeometry args={[0.7, 0.02, 16, 64]} />
                {goldMaterial}
            </mesh>
        </group>
    ), [])

    return (
        <group>
            {base}
            {seat}
            {tank}
        </group>
    )
}
