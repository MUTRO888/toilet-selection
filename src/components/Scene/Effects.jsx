import { EffectComposer, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export default function Effects() {
    return (
        <EffectComposer disableNormalPass>
            {/* NO BLOOM - Removing highlights */}

            {/* Soft Grain for texture */}
            <Noise
                opacity={0.05}
                blendFunction={BlendFunction.OVERLAY}
            />

            {/* Vignette for focus */}
            <Vignette
                eskil={false}
                offset={0.1}
                darkness={0.2}
            />
        </EffectComposer>
    )
}
