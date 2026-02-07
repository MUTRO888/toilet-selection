import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SCENE } from '../../config/constants'

export default function GroupRotation({ children }) {
    const groupRef = useRef()

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y -= SCENE.ROTATION_SPEED
        }
    })

    return <group ref={groupRef}>{children}</group>
}
