import React from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import Lights from './components/Scene/Lights'
import ToiletPaperVinyl from './components/Scene/ToiletPaperVinyl'
import GroupRotation from './components/Scene/GroupRotation'

import Background from './components/UI/Background'
import Header from './components/UI/Header'
import Marquee from './components/UI/Marquee'
import TrackInfo from './components/UI/TrackInfo'
import InputOverlay from './components/UI/InputOverlay'

import useMusicStore from './store/useMusicStore'
import './App.css'

function Scene() {
    return (
        <>
            <Lights />

            <group position={[0, -1.0, 0]} rotation={[Math.PI * 0.22, 0, 0]}>
                <GroupRotation>
                    <ToiletPaperVinyl />
                </GroupRotation>
            </group>
        </>
    )
}

function TrackDisplay() {
    const { title, artist } = useMusicStore()

    return (
        <div className="track-info">
            <span className="track-title">{title}</span>
            <span className="track-artist">{artist}</span>
        </div>
    )
}

export default function App() {
    return (
        <div className="app-layout">
            <div className="iphone-container">
                <div className="poster-container">
                    <Background />

                    <div className="scene-container">
                        <Canvas
                            camera={{
                                position: [0, 0.5, 7.5],
                                fov: 44,
                                near: 0.1,
                                far: 100
                            }}
                            shadows
                            gl={{
                                alpha: true,
                                antialias: true,
                                toneMapping: THREE.ACESFilmicToneMapping,
                                toneMappingExposure: 0.85
                            }}
                            onCreated={({ camera }) => {
                                camera.lookAt(0, -0.8, 0)
                            }}
                        >
                            <React.Suspense fallback={null}>
                                <Scene />
                            </React.Suspense>
                        </Canvas>
                    </div>

                    <div className="top-fade" />
                    <Header />
                    <TrackInfo />
                    <Marquee />
                </div>
            </div>

            <div className="control-panel">
                <div className="brand">
                    <span className="brand-title">Toilet Selection</span>
                    <span className="brand-sub">如厕精选 / Cyber Altar</span>
                </div>

                <div className="divider" />

                <div>
                    <span className="section-label">Now Playing</span>
                    <TrackDisplay />
                </div>

                <div className="divider" />

                <div>
                    <span className="section-label">Import</span>
                    <InputOverlay />
                </div>
            </div>
        </div>
    )
}
