import { Canvas } from '@react-three/fiber'
import { OrbitControls, Float, Environment } from '@react-three/drei'

import Lights from './components/Scene/Lights'
import VinylRecord from './components/Scene/VinylRecord'
import ToiletArt from './components/Scene/ToiletArt'
import AlbumSleeve from './components/Scene/AlbumSleeve'
import GroupRotation from './components/Scene/GroupRotation'

import Background from './components/UI/Background'
import Header from './components/UI/Header'
import Marquee from './components/UI/Marquee'
import InputOverlay from './components/UI/InputOverlay'

import useMusicStore from './store/useMusicStore'
import { SCENE } from './config/constants'
import './App.css'

function Scene() {
  const { coverImage } = useMusicStore()

  return (
    <>
      <Environment preset="studio" />
      <Lights />

      {/* 1. Background: Album Sleeve (Static) */}
      <group position={[0, 1.5, -2]} rotation={[-0.1, 0, 0]}>
        <AlbumSleeve coverImage={coverImage} />
      </group>

      {/* 2. Foreground: Rotating Vinyl + Chrome Weight */}
      <group position={[0, -1.5, 1]} rotation={[0.2, 0, 0]}>
        <GroupRotation>
          <VinylRecord />
          {/* Chrome Toilet Weight */}
          <group position={[0, 0.1, 0]} scale={0.15}>
            <ToiletArt variant="chrome" />
          </group>
        </GroupRotation>
      </group>

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
    <div className="app-layout">
      {/* Left: iPhone Preview */}
      <div className="iphone-container">
        <div className="poster-container">
          <Background />
          <Header />

          <div className="scene-container">
            <Canvas
              camera={{ position: [0, 4, 8], fov: 35 }}
              shadows
              gl={{ alpha: true, antialias: true }}
              onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
            >
              <Scene />
            </Canvas>
          </div>

          <Marquee />
        </div>
      </div>

      {/* Right: Control Panel */}
      <div className="control-panel">
        <h2>Control Center</h2>
        <p>Import music from Apple Music</p>
        <InputOverlay />
      </div>
    </div>
  )
}
