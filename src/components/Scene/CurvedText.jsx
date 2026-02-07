import { useMemo } from 'react'
import * as THREE from 'three'
import { COLORS } from '../../config/constants'

function createCharTexture(char, isBold = false) {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, 128, 128)
    ctx.font = `${isBold ? '900' : '400'} 90px "Inter", sans-serif`
    ctx.fillStyle = COLORS.HIGHLIGHT
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(char, 64, 64)

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
    charSize = 0.35,
    isBold = false
}) {
    const planes = useMemo(() => {
        const chars = text.split('')
        const totalChars = chars.filter(c => c !== ' ').length
        const angleSpan = endAngle - startAngle
        const angleStep = angleSpan / (totalChars + 1)
        const meshData = []

        let charIndex = 0
        chars.forEach((char) => {
            if (char === ' ') {
                charIndex += 0.5
                return
            }
            charIndex++
            const angle = startAngle + angleStep * charIndex
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius

            meshData.push({
                char,
                position: [x, yPos, z],
                rotation: [-Math.PI / 2, 0, -angle - Math.PI / 2]
            })
        })

        return meshData
    }, [text, radius, startAngle, endAngle, yPos])

    const textures = useMemo(() => {
        return text.split('').filter(c => c !== ' ').map(char => createCharTexture(char, isBold))
    }, [text, isBold])

    return (
        <group>
            {planes.map((plane, i) => (
                <mesh key={`${plane.char}-${i}`} position={plane.position} rotation={plane.rotation}>
                    <planeGeometry args={[charSize, charSize]} />
                    <meshBasicMaterial map={textures[i]} transparent side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
            ))}
        </group>
    )
}
