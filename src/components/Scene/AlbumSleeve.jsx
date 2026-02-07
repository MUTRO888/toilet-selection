import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function AlbumSleeve({ coverImage }) {
    // Default placeholder if coverImage is not provided
    const defaultCover = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1024&auto=format&fit=crop'
    const coverTexture = useTexture(coverImage || defaultCover)

    return (
        <mesh castShadow receiveShadow>
            <boxGeometry args={[5.2, 5.2, 0.15]} />

            {/* Material Array: [pos-x, neg-x, pos-y, neg-y, pos-z, neg-z] */}
            {/* Three.js Box faces: 0:Right, 1:Left, 2:Top, 3:Bottom, 4:Front, 5:Back */}
            <meshStandardMaterial attach="material-0" color="#1a1a1a" roughness={0.8} />
            <meshStandardMaterial attach="material-1" color="#1a1a1a" roughness={0.8} />
            <meshStandardMaterial attach="material-2" color="#1a1a1a" roughness={0.8} />
            <meshStandardMaterial attach="material-3" color="#1a1a1a" roughness={0.8} />
            <meshStandardMaterial attach="material-4" map={coverTexture} roughness={0.2} />
            <meshStandardMaterial attach="material-5" color="#1a1a1a" roughness={0.8} />
        </mesh>
    )
}
