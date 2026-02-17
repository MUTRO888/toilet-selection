import { useState, useEffect } from 'react'
import * as THREE from 'three'

const loader = new THREE.TextureLoader()

export default function AlbumSleeve({ coverImage }) {
    const defaultCover = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1024&auto=format&fit=crop'
    const [texture, setTexture] = useState(null)

    useEffect(() => {
        const url = coverImage || defaultCover
        loader.load(url, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace
            setTexture(tex)
        })
    }, [coverImage])

    const sideMat = <meshStandardMaterial color="#1a1a1a" roughness={0.8} />

    return (
        <mesh castShadow receiveShadow>
            <boxGeometry args={[5.2, 5.2, 0.15]} />
            {sideMat}
            {sideMat}
            {sideMat}
            {sideMat}
            <meshStandardMaterial attach="material-4" map={texture} roughness={0.2} />
            {sideMat}
        </mesh>
    )
}
