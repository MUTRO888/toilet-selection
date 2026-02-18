import { useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { SCENE } from '../../config/constants'

// RESTORED PROPORTIONS: Squat cylinder -> emphasizes the "Record" face
const ROLL_RADIUS = 3.2
const ROLL_HEIGHT = 1.6
const TUBE_RADIUS = 1.1

const PaperBodyMaterial = {
    uniforms: {
        uColor: { value: new THREE.Color('#Fdfdfd') },
    },
    vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vNormal;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      float noise = random(vUv * 300.0) * 0.03;
      vec3 col = uColor - noise;
      gl_FragColor = vec4(col, 1.0);
    }
  `
}

const PaperTopMaterial = {
    uniforms: {
        uColorLight: { value: new THREE.Color('#Fcfcfc') },
        uColorDark: { value: new THREE.Color('#F0F0F0') },
        uRadius: { value: ROLL_RADIUS },
        uInnerRadius: { value: TUBE_RADIUS }
    },
    vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform vec3 uColorLight;
    uniform vec3 uColorDark;
    uniform float uRadius;
    varying vec3 vPosition;

    void main() {
      float dist = length(vPosition.xy);
      
      // Clearer paper layers (lower frequency, higher contrast)
      float freq = 120.0; 
      float pattern = sin(dist * freq);
      
      float layer = smoothstep(-0.4, 0.4, pattern);
      
      // Base color with subtle radial gradient for depth
      vec3 baseColor = mix(uColorDark, uColorLight, layer);
      float vignette = smoothstep(0.0, uRadius, dist);
      vec3 color = mix(baseColor, baseColor * 0.95, vignette);
      
      // Sharp rim shadow
      float rim = smoothstep(uRadius - 0.2, uRadius, dist);
      color = mix(color, color * 0.85, rim * 0.5);

      gl_FragColor = vec4(color, 1.0);
    }
  `
}

// Clean Label Canvas (No Text, just Image)
function createMinimalLabelCanvas(imgElement) {
    const size = 1024
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const cx = size / 2

    // Background - Matte Grey/Beige
    ctx.fillStyle = '#EAE8E3'
    ctx.fillRect(0, 0, size, size)

    // Minimal geometric alignment lines
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cx, size * 0.45, 0, Math.PI * 2)
    ctx.stroke()

    const artRadius = size * 0.38

    if (imgElement) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(cx, cx, artRadius, 0, Math.PI * 2)
        ctx.clip()
        ctx.save()
        ctx.translate(cx, cx)
        ctx.rotate(Math.PI)
        ctx.drawImage(imgElement, -artRadius, -artRadius, artRadius * 2, artRadius * 2)
        ctx.restore()
        ctx.restore()

        ctx.strokeStyle = 'rgba(0,0,0,0.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(cx, cx, artRadius, 0, Math.PI * 2)
        ctx.stroke()
    } else {
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#333'
        ctx.font = '700 36px "Inter", sans-serif'
        ctx.fillText('SIDE A', cx, cx)
    }

    return canvas
}

export default function ToiletPaperVinyl({ coverImage }) {
    const labelTexture = useMemo(() => {
        const canvas = createMinimalLabelCanvas(null)
        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.anisotropy = 16
        return tex
    }, [])

    useEffect(() => {
        if (!coverImage) return
        const img = new Image()
        img.crossOrigin = "Anonymous"
        img.src = coverImage
        img.onload = () => {
            const canvas = createMinimalLabelCanvas(img)
            labelTexture.image = canvas
            labelTexture.needsUpdate = true
        }
    }, [coverImage, labelTexture])

    return (
        <group>
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[ROLL_RADIUS, ROLL_RADIUS, ROLL_HEIGHT, 128]} />
                <shaderMaterial args={[PaperBodyMaterial]} />
            </mesh>

            <mesh position={[0, ROLL_HEIGHT / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[TUBE_RADIUS, ROLL_RADIUS, 128, 1]} />
                <shaderMaterial args={[PaperTopMaterial]} side={THREE.FrontSide} />
            </mesh>

            <mesh position={[0, -ROLL_HEIGHT / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[TUBE_RADIUS, ROLL_RADIUS, 128, 1]} />
                <meshStandardMaterial color="#FDFDFD" roughness={0.9} />
            </mesh>

            <mesh>
                <cylinderGeometry args={[TUBE_RADIUS, TUBE_RADIUS, ROLL_HEIGHT - 0.02, 64]} />
                <meshStandardMaterial color="#F5F5F0" roughness={1.0} />
            </mesh>

            <mesh position={[0, ROLL_HEIGHT / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[TUBE_RADIUS]} />
                <meshStandardMaterial
                    map={labelTexture}
                    roughness={0.9}
                    metalness={0.0}
                />
            </mesh>
        </group>
    )
}
