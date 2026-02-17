import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS } from '../../config/constants'
import useMusicStore from '../../store/useMusicStore'

// 计算动态字号
function calculateAdaptiveFontSize(text, baseSize) {
    const length = text.replace(/\s/g, '').length
    if (length <= 8) return baseSize
    if (length <= 14) return baseSize * 0.85
    if (length <= 20) return baseSize * 0.7
    if (length <= 28) return baseSize * 0.58
    if (length <= 40) return baseSize * 0.48
    return baseSize * 0.38
}

// 根据字符数动态扩展弧度范围
function calculateAdaptiveArc(text, startAngle, endAngle) {
    const charCount = text.replace(/\s/g, '').length
    const baseArc = endAngle - startAngle
    const minCharArc = 0.045 // 每个字符最小弧度
    const neededArc = charCount * minCharArc

    if (neededArc <= baseArc) {
        return { start: startAngle, end: endAngle }
    }

    // 最大弧度不超过 0.85π（约153度），避免和另一半圈冲突
    const maxArc = Math.PI * 0.85
    const expandedArc = Math.min(neededArc, maxArc)
    const center = (startAngle + endAngle) / 2
    return {
        start: center - expandedArc / 2,
        end: center + expandedArc / 2
    }
}

function createCharTexture(char, fontSize = 90, isBold = false) {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, 256, 256)
    ctx.font = `${isBold ? '900' : '700'} ${fontSize}px "Inter", "Noto Sans SC", sans-serif`
    ctx.fillStyle = COLORS.HIGHLIGHT
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 添加文字阴影增强可读性
    ctx.shadowColor = 'rgba(0,0,0,0.8)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    
    ctx.fillText(char, 128, 128)

    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
}

export default function CurvedText({
    text,
    radius,
    startAngle,
    endAngle,
    yPos = 0.08,
    baseCharSize = 0.35,
    isBold = false
}) {
    const { coverImage } = useMusicStore()

    // 动态弧度范围
    const adaptiveArc = useMemo(() => {
        return calculateAdaptiveArc(text, startAngle, endAngle)
    }, [text, startAngle, endAngle])

    // 动态计算字号
    const charSize = useMemo(() => {
        return calculateAdaptiveFontSize(text, baseCharSize)
    }, [text, baseCharSize])

    // 动态计算字体大小（用于canvas）
    const fontSize = useMemo(() => {
        const len = text.replace(/\s/g, '').length
        if (len <= 8) return 120
        if (len <= 14) return 100
        if (len <= 20) return 85
        if (len <= 28) return 72
        if (len <= 40) return 60
        return 50
    }, [text])

    const planes = useMemo(() => {
        const chars = text.split('')
        const totalChars = chars.filter(c => c !== ' ').length
        const angleSpan = adaptiveArc.end - adaptiveArc.start
        const angleStep = angleSpan / (totalChars + 1)
        const meshData = []

        let charIndex = 0
        chars.forEach((char) => {
            if (char === ' ') {
                charIndex += 0.5
                return
            }
            charIndex++
            const angle = adaptiveArc.start + angleStep * charIndex
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius

            meshData.push({
                char,
                position: [x, yPos, z],
                rotation: [-Math.PI / 2, 0, -angle - Math.PI / 2]
            })
        })

        return meshData
    }, [text, radius, adaptiveArc, yPos])

    const textures = useMemo(() => {
        return text.split('').filter(c => c !== ' ').map(char => 
            createCharTexture(char, fontSize, isBold)
        )
    }, [text, fontSize, isBold])

    return (
        <group>
            {planes.map((plane, i) => (
                <mesh 
                    key={`${plane.char}-${i}`} 
                    position={plane.position} 
                    rotation={plane.rotation}
                >
                    <planeGeometry args={[charSize, charSize]} />
                    <meshBasicMaterial 
                        map={textures[i]} 
                        transparent 
                        side={THREE.DoubleSide} 
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    )
}
