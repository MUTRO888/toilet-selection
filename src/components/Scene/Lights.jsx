export default function Lights() {
    return (
        <>
            <ambientLight intensity={0.9} />
            <directionalLight
                position={[5, 10, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            <directionalLight
                position={[-5, 3, -5]}
                intensity={0.3}
                color="#4d4dff"
            />
        </>
    )
}
