import { useEffect } from 'react'
import useMusicStore from '../../store/useMusicStore'
import styles from './Background.module.css'

function toTintedRGB(color) {
    const base = [253, 251, 247]
    const src = [color.r, color.g, color.b]
    const strength = 0.08
    return base.map((b, i) => Math.round(b + (src[i] - b) * strength)).join(' ')
}

export default function Background() {
    const themeColor = useMusicStore((state) => state.themeColor)

    useEffect(() => {
        const rgb = themeColor ? toTintedRGB(themeColor) : '253 251 247'
        document.documentElement.style.setProperty('--bg-tint-rgb', rgb)
    }, [themeColor])

    return (
        <div className={styles.background} data-export-layer="background">
            <div className={styles.fill} />
        </div>
    )
}
