export default function Lights() {
    return (
        <>
            {/* 主光源 - Key Light: 从侧前方打光，营造体积感 */}
            <directionalLight
                position={[5, 8, 8]}
                intensity={0.7}
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

            {/* 补光 - Fill Light: 从另一侧补充，降低对比度 */}
            <directionalLight
                position={[-6, 4, 4]}
                intensity={0.25}
                color="#e8e8ff"
            />

            {/* 轮廓光 - Rim Light: 从后方打出轮廓 */}
            <directionalLight
                position={[0, 6, -8]}
                intensity={0.4}
                color="#fff8e7"
            />

            {/* 环境光 - 降低强度，让方向光主导 */}
            <ambientLight intensity={0.15} />
            
            {/* 底部反射光 - 模拟地面反光 */}
            <pointLight
                position={[0, -3, 2]}
                intensity={0.3}
                color="#4d4dff"
                distance={10}
                decay={2}
            />
        </>
    )
}
