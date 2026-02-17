import { useMemo, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import useMusicStore from '../../store/useMusicStore'
import { SCENE, COLORS } from '../../config/constants'

function createDefaultLabelCanvas() {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    // 黑胶底色
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(256, 256, 256, 0, Math.PI * 2)
    ctx.fill()

    // 唱片标签底色
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(256, 256, 240, 0, Math.PI * 2)
    ctx.fill()

    // 装饰圈
    ctx.strokeStyle = COLORS.HIGHLIGHT
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(256, 256, 210, 0, Math.PI * 2)
    ctx.stroke()

    // 默认文字
    ctx.fillStyle = COLORS.HIGHLIGHT
    ctx.textAlign = 'center'
    ctx.font = '900 36px Inter, sans-serif'
    ctx.fillText('如厕精选', 256, 180)
    ctx.font = '900 42px Inter, sans-serif'
    ctx.fillText('CLICK TO', 256, 240)
    ctx.fillText('UPLOAD', 256, 290)
    ctx.font = '400 22px Inter, sans-serif'
    ctx.fillText('ALBUM COVER', 256, 330)

    // 中心孔
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

    // 黑胶底色
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(256, 256, 256, 0, Math.PI * 2)
    ctx.fill()

    // 封面图
    ctx.save()
    ctx.beginPath()
    ctx.arc(256, 256, 240, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, 16, 16, 480, 480)
    ctx.restore()

    // 内圈装饰线
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(256, 256, 60, 0, Math.PI * 2)
    ctx.stroke()

    // 中心孔
    ctx.fillStyle = COLORS.VINYL
    ctx.beginPath()
    ctx.arc(256, 256, 30, 0, Math.PI * 2)
    ctx.fill()

    return canvas
}

export default function VinylRecord() {
    const labelMeshRef = useRef()
    const coverImage = useMusicStore((state) => state.coverImage)
    const [labelTexture, setLabelTexture] = useState(() => {
        const canvas = createDefaultLabelCanvas()
        return new THREE.CanvasTexture(canvas)
    })

    useEffect(() => {
        if (coverImage) {
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                const canvas = createCoverLabelCanvas(img)
                const newTexture = new THREE.CanvasTexture(canvas)
                newTexture.colorSpace = THREE.SRGBColorSpace
                setLabelTexture(newTexture)
                if (labelMeshRef.current) {
                    labelMeshRef.current.material.map = newTexture
                    labelMeshRef.current.material.needsUpdate = true
                }
            }
            img.src = coverImage
        }
    }, [coverImage])

    const grooves = useMemo(() => {
        return Array.from({ length: 15 }, (_, i) => (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.055, 0]}>
                <torusGeometry args={[1.6 + i * 0.12, 0.01, 8, 128]} />
                <meshBasicMaterial color="#1a1a1a" />
            </mesh>
        ))
    }, [])

    return (
        <group>
            {/* 黑胶主体 */}
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[SCENE.RECORD_RADIUS, SCENE.RECORD_RADIUS, 0.1, 128]} />
                <meshStandardMaterial 
                    color={COLORS.VINYL} 
                    roughness={0.2} 
                    metalness={0.3}
                    envMapIntensity={0.5}
                />
            </mesh>

            {/* 唱片纹路 */}
            {grooves}

            {/* 唱片标签 */}
            <mesh ref={labelMeshRef} position={[0, 0.055, 0]}>
                <cylinderGeometry args={[1.4, 1.4, 0.11, 128]} />
                <meshStandardMaterial 
                    map={labelTexture} 
                    roughness={0.4}
                    metalness={0.1}
                />
            </mesh>
        </group>
    )
}
