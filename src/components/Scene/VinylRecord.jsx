import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import useMusicStore from '../../store/useMusicStore'
import { SCENE, COLORS } from '../../config/constants'

function createDefaultLabelCanvas() {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(256, 256, 256, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#FF8C00'
    ctx.beginPath()
    ctx.arc(256, 256, 240, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'white'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(256, 256, 210, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = 'white'
    ctx.textAlign = 'center'
    ctx.font = '900 36px Inter, sans-serif'
    ctx.fillText('如厕精选', 256, 180)
    ctx.font = '900 48px Inter, sans-serif'
    ctx.fillText('CLICK TO', 256, 260)
    ctx.fillText('UPLOAD', 256, 320)
    ctx.font = '400 24px Inter, sans-serif'
    ctx.fillText('ALBUM COVER', 256, 370)

    ctx.fillStyle = COLORS.VINYL
    ctx.beginPath()
    ctx.arc(256, 256, 30, 0, Math.PI * 2)
    ctx.fill()

    return canvas
}

function createCoverLabelCanvas(img) {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(256, 256, 256, 0, Math.PI * 2)
    ctx.fill()

    ctx.save()
    ctx.beginPath()
    ctx.arc(256, 256, 240, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, 16, 16, 480, 480)
    ctx.restore()

    ctx.fillStyle = COLORS.VINYL
    ctx.beginPath()
    ctx.arc(256, 256, 30, 0, Math.PI * 2)
    ctx.fill()

    return canvas
}

export default function VinylRecord() {
    const labelMeshRef = useRef()
    const coverImage = useMusicStore((state) => state.coverImage)

    const labelTexture = useMemo(() => {
        const canvas = createDefaultLabelCanvas()
        return new THREE.CanvasTexture(canvas)
    }, [])

    useEffect(() => {
        if (coverImage && labelMeshRef.current) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                const canvas = createCoverLabelCanvas(img)
                const newTexture = new THREE.CanvasTexture(canvas)
                labelMeshRef.current.material.map = newTexture
                labelMeshRef.current.material.needsUpdate = true
            }
            img.src = coverImage
        }
    }, [coverImage])

    const grooves = useMemo(() => {
        return Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
                <torusGeometry args={[1.5 + i * 0.2, 0.015, 8, 128]} />
                <meshBasicMaterial color="#1a1a1a" />
            </mesh>
        ))
    }, [])

    return (
        <group>
            <mesh>
                <cylinderGeometry args={[SCENE.RECORD_RADIUS, SCENE.RECORD_RADIUS, 0.1, 128]} />
                <meshStandardMaterial color={COLORS.VINYL} roughness={0.25} metalness={0.4} />
            </mesh>

            {grooves}

            <mesh ref={labelMeshRef} position={[0, 0.06, 0]}>
                <cylinderGeometry args={[1.4, 1.4, 0.12, 64]} />
                <meshStandardMaterial map={labelTexture} roughness={0.3} />
            </mesh>
        </group>
    )
}
