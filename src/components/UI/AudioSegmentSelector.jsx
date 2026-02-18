import { useRef, useCallback } from 'react'
import useMusicStore from '../../store/useMusicStore'
import styles from './AudioSegmentSelector.module.css'

function formatTime(seconds) {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AudioSegmentSelector() {
    const { trackDuration, segmentStart, segmentEnd, setSegment } = useMusicStore()
    const trackRef = useRef(null)
    const dragging = useRef(null)

    const pxToTime = useCallback((clientX) => {
        const rect = trackRef.current.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        return ratio * trackDuration
    }, [trackDuration])

    const handlePointerDown = useCallback((handle) => (e) => {
        e.preventDefault()
        dragging.current = handle

        const onMove = (ev) => {
            const t = pxToTime(ev.clientX)
            const minGap = 5
            if (dragging.current === 'start') {
                setSegment(Math.min(t, segmentEnd - minGap), segmentEnd)
            } else {
                setSegment(segmentStart, Math.max(t, segmentStart + minGap))
            }
        }

        const onUp = () => {
            dragging.current = null
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
        }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
    }, [pxToTime, segmentStart, segmentEnd, setSegment])

    if (!trackDuration) return null

    const startPct = (segmentStart / trackDuration) * 100
    const endPct = (segmentEnd / trackDuration) * 100
    const clipDuration = segmentEnd - segmentStart

    return (
        <div className={styles.wrap}>
            <div className={styles.track} ref={trackRef}>
                <div
                    className={styles.selected}
                    style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                />
                <div
                    className={styles.handle}
                    style={{ left: `${startPct}%` }}
                    onPointerDown={handlePointerDown('start')}
                />
                <div
                    className={styles.handle}
                    style={{ left: `${endPct}%` }}
                    onPointerDown={handlePointerDown('end')}
                />
            </div>
            <div className={styles.labels}>
                <span>{formatTime(segmentStart)}</span>
                <span className={styles.duration}>{formatTime(clipDuration)}</span>
                <span>{formatTime(segmentEnd)}</span>
            </div>
        </div>
    )
}
