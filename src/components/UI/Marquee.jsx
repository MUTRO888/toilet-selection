import styles from './Marquee.module.css'
import useMusicStore from '../../store/useMusicStore'

export default function Marquee() {
    const text = "保持通畅 /// KEEP IT SMOOTH /// "
    const exportState = useMusicStore(state => state.exportState)
    const isRecording = ['recording', 'playing'].includes(exportState)

    const content = Array(8).fill(text).join("")

    return (
        <div className={styles.marquee}>
            <div className={`${styles.content} ${isRecording ? styles.paused : ''}`}>
                {content}
            </div>
        </div>
    )
}
