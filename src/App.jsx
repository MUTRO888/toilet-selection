import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import Lights from './components/Scene/Lights'
import VinylRecord from './components/Scene/VinylRecord'
import ToiletArt from './components/Scene/ToiletArt'
import CurvedText from './components/Scene/CurvedText'
import GroupRotation from './components/Scene/GroupRotation'

import Header from './components/UI/Header'
import Marquee from './components/UI/Marquee'
import InputOverlay from './components/UI/InputOverlay'

import useMusicStore from './store/useMusicStore'
import { SCENE } from './config/constants'
import './App.css'

function Scene() {
  const { title, artist } = useMusicStore()
  const { RECORD_RADIUS, TEXT_RADIUS, VINYL_Y, TEXT_ELEVATION } = SCENE

  return (
    <>
      <Lights />

      <GroupRotation>
        <group position={[0, VINYL_Y, 0]}>
          <VinylRecord />
          <ToiletArt />
        </group>
      </GroupRotation>

      <group position={[0, VINYL_Y + TEXT_ELEVATION, 0]}>
        <CurvedText
          text={title}
          radius={TEXT_RADIUS + 0.5}
          startAngle={Math.PI * 1.38}
          endAngle={Math.PI * 1.62}
          yPos={0.08}
          charSize={0.42}
          isBold
        />
        <CurvedText
          text={artist.toUpperCase()}
          radius={TEXT_RADIUS + 0.12}
          startAngle={Math.PI * 1.43}
          endAngle={Math.PI * 1.57}
          yPos={0.08}
          charSize={0.35}
          isBold
        />
      </group>

      <gridHelper
        args={[30, 30, 0x000000, 0x000000]}
        position={[0, -1, 0]}
        material-opacity={0.08}
        material-transparent
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  )
}

export default function App() {
  const { CAMERA } = SCENE

  return (
    <div className="poster-container">
      <Header />

      <div className="scene-container">
        <Canvas
          camera={{ position: CAMERA.POSITION, fov: CAMERA.FOV }}
          shadows
          gl={{ alpha: true, antialias: true }}
          onCreated={({ camera }) => camera.lookAt(...CAMERA.LOOK_AT)}
        >
          <Scene />
        </Canvas>
      </div>

      <InputOverlay />
      <Marquee />
    </div>
  )
}
