import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS } from '../../config/constants'

function createEmojiTexture() {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#F79E1B'
    ctx.fillRect(0, 0, 512, 512)

    const scale = 0.75
    const offsetX = 256 * (1 - scale)
    const offsetY = 256 * (1 - scale)

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    ctx.strokeStyle = '#000'
    ctx.lineWidth = 32
    ctx.lineCap = 'round'

    ctx.beginPath()
    ctx.moveTo(170, 200)
    ctx.lineTo(230, 250)
    ctx.moveTo(170, 250)
    ctx.lineTo(230, 200)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(280, 200)
    ctx.lineTo(340, 250)
    ctx.moveTo(280, 250)
    ctx.lineTo(340, 200)
    ctx.stroke()

    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.ellipse(256, 360, 45, 55, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#00F'
    ctx.beginPath()
    ctx.arc(190, 290, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(178, 290, 24, 140)

    ctx.beginPath()
    ctx.arc(320, 290, 18, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(308, 290, 24, 140)

    ctx.restore()

    return new THREE.CanvasTexture(canvas)
}

export default function ToiletArt() {
    const emojiTexture = useMemo(() => createEmojiTexture(), [])

    return (
        <group position={[2.4, 0.05, 0]} scale={0.6}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <cylinderGeometry args={[0.35, 0.5, 1.0, 64]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>

            <mesh position={[0, 1.1, 0.35]} scale={[1, 1, 1.3]} castShadow>
                <cylinderGeometry args={[0.85, 0.4, 0.85, 64]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.5, 0.4]} scale={[1, 1.25, 1]}>
                <circleGeometry args={[0.65, 64]} />
                <meshPhysicalMaterial color={COLORS.ACCENT} transparent opacity={0.7} roughness={0} transmission={0.5} thickness={0.5} />
            </mesh>

            <mesh position={[0, 1.3, -0.5]} castShadow>
                <boxGeometry args={[1.1, 1.2, 0.6]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>

            <mesh position={[0, 1.9, -0.5]}>
                <boxGeometry args={[1.15, 0.15, 0.65]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>

            <mesh position={[0.4, 1.6, -0.2]}>
                <boxGeometry args={[0.2, 0.08, 0.08]} />
                <meshStandardMaterial color="#dddddd" roughness={0.1} metalness={0.8} />
            </mesh>

            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1.55, 0.35]} scale={[1, 1.4, 1]}>
                <torusGeometry args={[0.6, 0.1, 32, 100]} />
                <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.05} />
            </mesh>

            <mesh position={[0, 1.65, -0.2]} rotation={[-Math.PI * 0.55, 0, 0]} scale={[1, 1, 1.3]}>
                <cylinderGeometry args={[0.8, 0.8, 0.08, 64]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
            </mesh>

            <mesh position={[0, 2.6, 0.35]} rotation={[-1.2, -1.5, -0.3]}>
                <sphereGeometry args={[0.65, 64, 64]} />
                <meshBasicMaterial map={emojiTexture} />
            </mesh>
        </group>
    )
}
