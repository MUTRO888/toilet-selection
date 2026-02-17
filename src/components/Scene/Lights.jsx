export default function Lights() {
    return (
        <>
            {/* Key light — warm white, strong for paper surface */}
            <directionalLight
                position={[5, 8, 8]}
                intensity={1.0}
                color="#ffffff"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-near={0.1}
                shadow-camera-far={50}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                shadow-bias={-0.001}
            />

            {/* Fill light — cool tint */}
            <directionalLight
                position={[-6, 4, 4]}
                intensity={0.35}
                color="#e8e8ff"
            />

            {/* Rim light — warm backlight for edge definition */}
            <directionalLight
                position={[0, 6, -8]}
                intensity={0.4}
                color="#fff8e7"
            />

            <hemisphereLight args={['#ffffff', '#4d4dff', 0.2]} />

            <ambientLight intensity={0.15} />

            {/* Neon underglow — brand color on white paper */}
            <pointLight
                position={[0, -2, 2]}
                intensity={2.0}
                color="#ccff00"
                distance={8}
                decay={2}
            />

            {/* Blue accent — subtle color contrast */}
            <pointLight
                position={[2, 0, 3]}
                intensity={0.4}
                color="#4d4dff"
                distance={8}
                decay={2}
            />
        </>
    )
}
