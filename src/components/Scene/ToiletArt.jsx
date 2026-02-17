import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { COLORS } from '../../config/constants'

// 白瓷材质 - 提高粗糙度以展现陶瓷阴影细节
const porcelainMaterial = (
    <meshStandardMaterial
        color="#F0F0F0"
        metalness={0.05}
        roughness={0.28}
        envMapIntensity={0.8}
    />
)

// 黄金配件材质
const goldMaterial = (
    <meshStandardMaterial
        color="#FFD700"
        metalness={1.0}
        roughness={0.2}
        envMapIntensity={1.5}
    />
)

export default function ToiletArt() {
    // 马桶水箱
    const tank = useMemo(() => (
        <group>
            {/* 水箱主体 */}
            <mesh position={[0, 1.4, -0.6]} castShadow receiveShadow>
                <boxGeometry args={[1.2, 1.0, 0.5]} />
                {porcelainMaterial}
            </mesh>
            {/* 水箱盖 */}
            <mesh position={[0, 1.95, -0.6]} castShadow>
                <boxGeometry args={[1.25, 0.08, 0.55]} />
                {porcelainMaterial}
            </mesh>
            {/* 冲水按钮 - 黄金 */}
            <mesh position={[0.3, 1.99, -0.6]} castShadow>
                <cylinderGeometry args={[0.08, 0.08, 0.05, 32]} />
                {goldMaterial}
            </mesh>
            <mesh position={[-0.3, 1.99, -0.6]} castShadow>
                <cylinderGeometry args={[0.06, 0.06, 0.05, 32]} />
                {goldMaterial}
            </mesh>
            {/* 水箱装饰线 - 黄金 */}
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

    // 马桶底座
    const base = useMemo(() => (
        <group>
            {/* 底座主体 */}
            <mesh position={[0, 0.4, 0.1]} castShadow receiveShadow>
                <cylinderGeometry args={[0.5, 0.6, 0.8, 64]} />
                {porcelainMaterial}
            </mesh>
            {/* 底座底部 */}
            <mesh position={[0, 0.05, 0.1]} castShadow receiveShadow>
                <cylinderGeometry args={[0.65, 0.65, 0.1, 64]} />
                {porcelainMaterial}
            </mesh>
        </group>
    ), [])

    // 马桶座圈和盖子
    const seat = useMemo(() => (
        <group>
            {/* 马桶碗主体 */}
            <mesh position={[0, 0.9, 0.25]} castShadow receiveShadow>
                <cylinderGeometry args={[0.75, 0.4, 0.7, 64]} />
                {porcelainMaterial}
            </mesh>
            {/* 碗口内缘 */}
            <mesh position={[0, 1.25, 0.25]} castShadow>
                <torusGeometry args={[0.55, 0.12, 32, 64]} />
                {porcelainMaterial}
            </mesh>
            {/* 座圈 */}
            <mesh position={[0, 1.28, 0.3]} castShadow>
                <torusGeometry args={[0.7, 0.08, 32, 64]} />
                <meshStandardMaterial
                    color="#F5F5F5"
                    metalness={0.05}
                    roughness={0.2}
                />
            </mesh>
            {/* 座圈黄金装饰线 */}
            <mesh position={[0, 1.32, 0.3]} castShadow>
                <torusGeometry args={[0.7, 0.02, 16, 64]} />
                {goldMaterial}
            </mesh>
            {/* 马桶盖 - 打开状态 */}
            <mesh 
                position={[0, 1.6, -0.15]} 
                rotation={[-Math.PI * 0.35, 0, 0]}
                castShadow
            >
                <cylinderGeometry args={[0.72, 0.72, 0.06, 64]} />
                {porcelainMaterial}
            </mesh>
            {/* 盖子铰链 - 黄金 */}
            <mesh position={[0, 1.5, -0.4]} castShadow>
                <boxGeometry args={[0.9, 0.1, 0.15]} />
                {goldMaterial}
            </mesh>
        </group>
    ), [])

    return (
        <group position={[0, 0, 0]} scale={0.35}>
            {base}
            {seat}
            {tank}
        </group>
    )
}
