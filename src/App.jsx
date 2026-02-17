import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

import Lights from './components/Scene/Lights'
import VinylRecord from './components/Scene/VinylRecord'
import ToiletArt from './components/Scene/ToiletArt'
import AlbumSleeve from './components/Scene/AlbumSleeve'
import CurvedText from './components/Scene/CurvedText'
import GroupRotation from './components/Scene/GroupRotation'

import Background from './components/UI/Background'
import Header from './components/UI/Header'
import Marquee from './components/UI/Marquee'
import InputOverlay from './components/UI/InputOverlay'

import useMusicStore from './store/useMusicStore'
import './App.css'

function Scene() {
  const { title, artist, coverImage } = useMusicStore()

  return (
    <>
      <Environment preset="studio" environmentIntensity={0.5} />
      <Lights />

      {/* 1. Background: Album Sleeve (Static) - 铺满背景墙 */}
      <group position={[0, 1.0, -5]} rotation={[0, 0, 0]}>
        <AlbumSleeve coverImage={coverImage} />
      </group>

      {/* 2. Foreground: Vinyl + Toilet - 微仰视构图 */}
      <group position={[0, -0.8, 0]} rotation={[Math.PI * 0.38, 0, 0]}>
        <GroupRotation>
          <VinylRecord />
          {/* 马桶放在唱片中心 - 稍微抬高一点 */}
          <group position={[0, 0.12, 0]} scale={0.45}>
            <ToiletArt />
          </group>
        </GroupRotation>

        {/* 静态文字环绕 - 放在唱片标签边缘内圈 */}
        <group position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* 歌名 - 上半圈 */}
          <CurvedText
            text={title}
            radius={1.15}
            startAngle={Math.PI * 1.2}
            endAngle={Math.PI * 1.8}
            yPos={0.02}
            baseCharSize={0.32}
            isBold
          />
          {/* 艺术家 - 下半圈 */}
          <CurvedText
            text={artist.toUpperCase()}
            radius={1.15}
            startAngle={Math.PI * 0.2}
            endAngle={Math.PI * 0.8}
            yPos={0.02}
            baseCharSize={0.28}
          />
        </group>
      </group>
    </>
  )
}

export default function App() {
  return (
    <div className="app-layout">
      {/* Left: iPhone Preview */}
      <div className="iphone-container">
        <div className="poster-container">
          <Background />
          <Header />

          <div className="scene-container">
            <Canvas
              camera={{
                position: [0, 1.8, 8],  // 微仰视：低机位，看到黑胶厚度和椭圆透视
                fov: 42,
                near: 0.1,
                far: 100
              }}
              shadows
              gl={{
                alpha: true,
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 0.8
              }}
              onCreated={({ camera }) => {
                // 相机看向场景中心，微仰视构图
                camera.lookAt(0, 0, 0)
              }}
            >
              <React.Suspense fallback={null}>
                <Scene />
              </React.Suspense>
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
