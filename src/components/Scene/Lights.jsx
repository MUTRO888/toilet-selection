import { Environment } from '@react-three/drei'

export default function Lights() {
    return (
        <>
            {/* Soft Top Light - Main Illumination without harsh specular */}
            <rectAreaLight
                width={10}
                height={10}
                color="#ffffff"
                intensity={1.0}
                position={[0, 8, 0]}
                lookAt={[0, 0, 0]}
            />

            {/* Raking Light - Low angle to catch texture of paper layers */}
            <directionalLight
                position={[5, 2, 5]}
                intensity={0.6}
                color="#fffcf5"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-bias={-0.0001}
                shadow-normalBias={0.02}
            />

            {/* Fill - Very soft cool fill */}
            <directionalLight
                position={[-5, 4, -2]}
                intensity={0.4}
                color="#f0f2f5"
            />

            {/* Ambient - Base brightness */}
            <ambientLight intensity={0.5} color="#ffffff" />

            {/* Subtle Environment for non-metallic reflections */}
            <Environment preset="city" blur={1} />
        </>
    )
}
