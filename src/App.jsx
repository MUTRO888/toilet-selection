import React, { useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

import Lights from './components/Scene/Lights'
import ToiletPaperVinyl from './components/Scene/ToiletPaperVinyl'
import GroupRotation from './components/Scene/GroupRotation'
import Effects from './components/Scene/Effects'

import Background from './components/UI/Background'
import Header from './components/UI/Header'
import Marquee from './components/UI/Marquee'
import TrackInfo from './components/UI/TrackInfo'
import ReviewDisplay from './components/UI/ReviewDisplay'
import InputOverlay from './components/UI/InputOverlay'
import ExportControls from './components/UI/ExportControls'

import useMusicStore from './store/useMusicStore'
import './App.css'

function Scene({ coverImage }) {
    return (
        <>
            <Lights />

            <group position={[0, -0.9, 0]} rotation={[Math.PI * 0.25, 0, 0]}>
                <GroupRotation>
                    <ToiletPaperVinyl coverImage={coverImage} />
                </GroupRotation>
            </group>
        </>
    )
}

function ReviewInput() {
    const { reviewText, setReviewText } = useMusicStore()
    return (
        <textarea
            className="review-input"
            placeholder="Write a toilet review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
        />
    )
}

export default function App() {
    const coverImage = useMusicStore((state) => state.coverImage)

    const handleCanvasCreated = useCallback(({ camera }) => {
        camera.lookAt(0, -0.5, 0)
    }, [])

    return (
        <div className="app-layout">
            <div className="iphone-container" id="phone-container">
                <div className="poster-container">
                    <Background />

                    <div className="scene-container">
                        <Canvas
                            camera={{
                                position: [0, 6, 11],
                                fov: 30,
                                near: 0.1,
                                far: 100
                            }}
                            shadows
                            gl={{
                                alpha: true,
                                antialias: true,
                                toneMapping: THREE.ReinhardToneMapping,
                                toneMappingExposure: 1.0
                            }}
                            onCreated={handleCanvasCreated}
                        >
                            <React.Suspense fallback={null}>
                                <Scene coverImage={coverImage} />
                                <Effects />
                            </React.Suspense>
                        </Canvas>
                    </div>

                    <div className="top-fade" />
                    <div className="bottom-fade" />

                    <Header />
                    <TrackInfo />
                    <ReviewDisplay />
                    <Marquee />
                </div>
            </div>

            <div className="control-panel">
                <div className="brand">
                    <span className="brand-title">Toilet Selection</span>
                    <span className="brand-sub">如厕精选 / Organic High-Fidelity</span>
                </div>

                <div className="divider" />

                <div>
                    <span className="section-label">Music</span>
                    <InputOverlay />
                </div>

                <div className="divider" />

                <div>
                    <span className="section-label">Toilet Review</span>
                    <ReviewInput />
                </div>

                <div className="divider" />

                <ExportControls />
            </div>
        </div>
    )
}
