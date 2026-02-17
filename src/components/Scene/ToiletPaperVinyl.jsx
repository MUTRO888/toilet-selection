import { useMemo } from 'react'
import * as THREE from 'three'
import { SCENE, COLORS } from '../../config/constants'

const ROLL_RADIUS = SCENE.RECORD_RADIUS // 3.5
const ROLL_HEIGHT = 0.8
const TUBE_RADIUS = 1.3
const HOLE_RADIUS = 0.45

function createTubeLabelCanvas() {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const cx = size / 2

    // Cardboard brown
    ctx.fillStyle = '#A07850'
    ctx.beginPath()
    ctx.arc(cx, cx, cx, 0, Math.PI * 2)
    ctx.fill()

    // Cardboard grain rings
    ctx.strokeStyle = 'rgba(100, 70, 20, 0.1)'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 10; i++) {
        ctx.beginPath()
        ctx.arc(cx, cx, 70 + i * 18, 0, Math.PI * 2)
        ctx.stroke()
    }

    // Brand text
    ctx.fillStyle = COLORS.HIGHLIGHT
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '900 36px Inter, sans-serif'
    ctx.fillText('如厕精选', cx, cx - 20)
    ctx.font = '600 12px Inter, sans-serif'
    ctx.fillText('TOILET SELECTION', cx, cx + 15)

    // Center hole
    ctx.fillStyle = '#2A1A05'
    ctx.beginPath()
    ctx.arc(cx, cx, 42, 0, Math.PI * 2)
    ctx.fill()

    return canvas
}

// Build a smooth ribbon geometry from a curve
function createRibbonGeometry(curve, segments, halfWidth) {
    const pts = curve.getPoints(segments)
    const frames = curve.computeFrenetFrames(segments, false)

    const positions = []
    const uvs = []
    const indices = []

    for (let i = 0; i <= segments; i++) {
        const p = pts[i]
        const B = frames.binormals[i]
        const t = i / segments

        positions.push(
            p.x + B.x * halfWidth, p.y + B.y * halfWidth, p.z + B.z * halfWidth,
            p.x - B.x * halfWidth, p.y - B.y * halfWidth, p.z - B.z * halfWidth
        )
        uvs.push(0, t, 1, t)
    }

    for (let i = 0; i < segments; i++) {
        const a = i * 2
        indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
}

export default function ToiletPaperVinyl() {
    const labelTexture = useMemo(() => {
        const canvas = createTubeLabelCanvas()
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        return tex
    }, [])

    // Paper layer ridges (paper layers = vinyl grooves)
    const ridges = useMemo(() => {
        const count = 30
        const inner = TUBE_RADIUS + 0.06
        const outer = ROLL_RADIUS - 0.06
        const step = (outer - inner) / count
        const y = ROLL_HEIGHT / 2 + 0.006
        const shades = ['#E8E0D2', '#F0E8DA', '#E4DCD0', '#ECE4D6']

        return Array.from({ length: count }, (_, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, y, 0]}>
                <torusGeometry args={[inner + i * step, 0.022, 6, 128]} />
                <meshStandardMaterial color={shades[i % 4]} roughness={0.92} metalness={0} />
            </mesh>
        ))
    }, [])

    // Flowing paper strip — smooth curve ribbon
    const stripGeo = useMemo(() => {
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(ROLL_RADIUS, 0, 0),
            new THREE.Vector3(ROLL_RADIUS + 0.6, -0.05, 0.3),
            new THREE.Vector3(ROLL_RADIUS + 1.4, -0.3, 0.6),
            new THREE.Vector3(ROLL_RADIUS + 1.9, -1.0, 0.4),
            new THREE.Vector3(ROLL_RADIUS + 2.2, -2.0, 0.7),
            new THREE.Vector3(ROLL_RADIUS + 2.0, -3.0, 0.3),
            new THREE.Vector3(ROLL_RADIUS + 1.6, -3.8, 0.0),
        ])
        return createRibbonGeometry(curve, 48, ROLL_HEIGHT * 0.42)
    }, [])

    return (
        <group>
            {/* Paper roll body */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[ROLL_RADIUS, ROLL_RADIUS, ROLL_HEIGHT, 128]} />
                <meshStandardMaterial color="#F5F0E6" roughness={0.85} metalness={0} />
            </mesh>

            {/* Paper layer ridges on top face */}
            {ridges}

            {/* Cardboard tube */}
            <mesh>
                <cylinderGeometry args={[TUBE_RADIUS, TUBE_RADIUS, ROLL_HEIGHT, 128]} />
                <meshStandardMaterial color="#8B6914" roughness={0.7} metalness={0.05} />
            </mesh>

            {/* Label face — brand on cardboard */}
            <mesh position={[0, ROLL_HEIGHT / 2 + 0.006, 0]}>
                <cylinderGeometry args={[TUBE_RADIUS, TUBE_RADIUS, 0.012, 128]} />
                <meshStandardMaterial map={labelTexture} roughness={0.6} metalness={0.05} />
            </mesh>

            {/* Inner tube hollow */}
            <mesh>
                <cylinderGeometry args={[HOLE_RADIUS, HOLE_RADIUS, ROLL_HEIGHT + 0.02, 64]} />
                <meshStandardMaterial
                    color="#2A1A05"
                    roughness={0.85}
                    metalness={0}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Chrome holder rod through center */}
            <mesh>
                <cylinderGeometry args={[0.12, 0.12, ROLL_HEIGHT * 1.8, 16]} />
                <meshStandardMaterial color="#d0d0d0" roughness={0.15} metalness={0.95} />
            </mesh>

            {/* Edge rings — top and bottom */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROLL_HEIGHT / 2, 0]}>
                <torusGeometry args={[ROLL_RADIUS, 0.008, 8, 128]} />
                <meshStandardMaterial color="#DDD8CC" roughness={0.7} metalness={0.05} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -ROLL_HEIGHT / 2, 0]}>
                <torusGeometry args={[ROLL_RADIUS, 0.008, 8, 128]} />
                <meshStandardMaterial color="#DDD8CC" roughness={0.7} metalness={0.05} />
            </mesh>

            {/* Flowing paper strip — the unmistakable TP cue */}
            <group rotation={[0, 0.4, 0]}>
                <mesh geometry={stripGeo}>
                    <meshStandardMaterial
                        color="#F5F0E6"
                        roughness={0.9}
                        metalness={0}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </group>
        </group>
    )
}
